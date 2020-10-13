import React, { useEffect, useState, createRef, useRef } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, Run, AsyncStatus } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import TimelineRow from './TimelineRow';
import useGraph, { GraphState, GraphSortBy, validatedParameter } from './useGraph';
import { StepRowData, RowDataAction, RowDataModel } from './useRowData';
import { useTranslation } from 'react-i18next';
import TimelineHeader from './TimelineHeader';
import TimelineFooter from './TimelineFooter';
import { useQueryParams, StringParam } from 'use-query-params';
import FullPageContainer from '../FullPageContainer';
import useSeachField, { SearchResultModel } from '../../hooks/useSearchField';
import GenericError from '../GenericError';
import { ItemRow } from '../Structure';
import { TFunction } from 'i18next';

export const ROW_HEIGHT = 28;
export type Row = { type: 'step'; data: Step } | { type: 'task'; data: Task[] };
type StepIndex = { name: string; index: number };

type TimelineFilters = {
  steps: string[];
  tasks: string[];
};

export type RowCounts = {
  all: number;
  completed: number;
  running: number;
  failed: number;
};

//
// Self containing component for rendering everything related to timeline. Component fetched (and subscribes for live events) steps and tasks from different
// endpoints. View is supposed to be full page (and full page only) since component itself will use virtualised scrolling.
//
type TimelineProps = {
  run: Run;
  rowData: RowDataModel;
  rowDataDispatch: React.Dispatch<RowDataAction>;
  status: AsyncStatus;
  groupBy: { value: boolean; set: (val: boolean) => void };
};

const VirtualizedTimeline: React.FC<TimelineProps> = ({ run, rowData, rowDataDispatch, status, groupBy }) => {
  const [q, sq] = useQueryParams({
    group: StringParam,
    order: StringParam,
    direction: StringParam,
    steps: StringParam,
  });
  const { t } = useTranslation();
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef<HTMLDivElement>(null);
  const listContainer = useComponentSize(_listContainer);

  // Rows to be iterated in timeline
  const [rows, setRows] = useState<Row[]>([]);
  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  const [showFullscreen, setFullscreen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<null | string>(null);
  // Counts of current rows for each status
  const [counts, setCounts] = useState<RowCounts>({ all: 0, completed: 0, running: 0, failed: 0 });

  //
  // Local filterings
  //

  const [filters, setFilters] = useState<TimelineFilters>({ steps: [], tasks: [] });
  useEffect(() => {
    const stepFilters = q.steps;

    if (stepFilters) {
      setFilters({ ...filters, steps: stepFilters.split(',') });
    } else {
      setFilters({ ...filters, steps: [] });
    }
  }, [q.steps]); // eslint-disable-line

  //
  // Graph measurements and rendering logic
  //

  // Graph data. Need to know start and end time of run to render lines
  const { graph, dispatch: graphDispatch } = useGraph(run.ts_epoch, run.finished_at || Date.now());

  //
  // Query parameters handling
  //

  useEffect(() => {
    const sortDir = validatedParameter<'asc' | 'desc'>(q.direction, graph.sortDir, ['asc', 'desc'], 'asc');
    if (sortDir) {
      graphDispatch({
        type: 'sortDir',
        dir: sortDir,
      });
    }

    const sortBy = validatedParameter<'startTime' | 'endTime' | 'duration'>(
      q.order,
      graph.sortBy,
      ['startTime', 'endTime', 'duration'],
      'startTime',
    );
    if (sortBy) {
      graphDispatch({ type: 'sortBy', by: sortBy });
    }
  }, [q, graph, graphDispatch]);

  //
  // Search API
  //

  const { results: searchResults, fieldProps: searchFieldProps } = useSeachField(run.flow_id, run.run_number);

  //
  // Data processing
  //

  // Figure out rows that should be visible if something related to that changes
  // This is not most performant way to do this so we might wanna update these functionalities later on.
  useEffect(() => {
    // Filter out steps if we have step filters on.
    const visibleSteps: Step[] = Object.keys(rowData)
      .map((key) => rowData[key].step)
      .filter(
        (item): item is Step =>
          // Filter out possible undefined (should not really happen, might though if there is some timing issues with REST and websocket)
          item !== undefined &&
          // Check if step filter is active. Show only selected steps
          (filters.steps.length === 0 || filters.steps.indexOf(item.step_name) > -1) &&
          // Filter out steps starting with _ since they are not interesting to user
          !item.step_name.startsWith('_'),
      );

    // Make list of rows. Note that in list steps and tasks are equal rows, they are just rendered a bit differently
    const newRows: Row[] = makeVisibleRows(rowData, graph, visibleSteps, statusFilter, searchResults, groupBy.value);

    if (visibleSteps.length > 0) {
      // Find last point in timeline. We could do this somewhere else.. Like in useRowData reducer
      const highestTimestamp = findHighestTimestampForGraph(rowData, graph, visibleSteps, groupBy.value);

      graphDispatch({ type: 'init', start: visibleSteps[0].ts_epoch, end: highestTimestamp });
    }

    const rowsToUpdate = !groupBy.value ? newRows.sort(sortRows(graph.sortBy, graph.sortDir)) : newRows;

    // If no grouping, sort tasks here.
    setRows(rowsToUpdate);
    /* eslint-disable */
  }, [
    rowData,
    graphDispatch,
    filters.steps,
    graph.min,
    graph.sortBy,
    graph.sortDir,
    groupBy,
    statusFilter,
    searchResults,
  ]);
  /* eslint-enable */

  // Follow counts of rows by each status.
  useEffect(() => {
    const allRows = Object.keys(rowData).reduce((arr: Task[], key) => {
      if (key.startsWith('_')) return arr;

      const tasks = Object.keys(rowData[key].data).reduce((arr2: Task[], key2) => {
        const rowTasks = rowData[key].data[key2];
        return arr2.concat([rowTasks[rowTasks.length - 1]]);
      }, []);
      return arr.concat(tasks);
    }, []);

    const newCounts = {
      all: 0,
      completed: 0,
      running: 0,
      failed: 0,
    };

    for (const row of allRows) {
      newCounts.all++;
      if (row.status === 'completed' && row.finished_at) {
        newCounts.completed++;
      } else if (row.status === 'failed') {
        newCounts.failed++;
      } else if (row.status === 'running' || !row.finished_at) {
        newCounts.running++;
      }
    }

    setCounts(newCounts);
  }, [rowData]);

  // Update step position indexes (for sticky headers). We might wanna do this else where
  useEffect(() => {
    const stepPos: StepIndex[] = [];
    let index = 0;

    for (const current of rows) {
      index++;
      if (current.type === 'step') {
        stepPos.push({ name: current.data.step_name, index });
      }
    }

    setStepPositions(stepPos);
  }, [rows]);

  // Reset everything if run is changed
  useEffect(() => {
    graphDispatch({ type: 'reset' });
    setCounts({ all: 0, completed: 0, running: 0, failed: 0 });
  }, [run.run_number, graphDispatch]);

  //
  // Button behaviour
  //

  const expandAll = () => {
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'open', id: stepName });
    });
  };

  const collapseAll = () => {
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'close', id: stepName });
    });
  };

  //
  // Horizontal dragging of whole graph
  //

  const [drag, setDrag] = useState({ dragging: false, start: 0 });
  const move = (clientX: number) => {
    if (drag.dragging) {
      if (_listContainer && _listContainer.current) {
        const movement = (clientX - drag.start) / _listContainer.current?.clientWidth;
        setDrag({ ...drag, start: clientX });
        graphDispatch({ type: 'move', value: -((graph.max - graph.min) * movement) });
      }
    }
  };

  const startMove = (clientX: number) => {
    setDrag({ ...drag, dragging: true, start: clientX });
  };

  const stopMove = () => {
    if (drag.dragging) {
      setDrag({ dragging: false, start: 0 });
    }
  };

  const content = (
    <VirtualizedTimelineContainer style={showFullscreen ? { padding: '0 1rem' } : {}}>
      <VirtualizedTimelineSubContainer>
        <TimelineHeader
          graph={graph}
          zoom={(dir) => graphDispatch({ type: dir === 'out' ? 'zoomOut' : 'zoomIn' })}
          zoomReset={() => graphDispatch({ type: 'resetZoom' })}
          updateSortBy={(by) => sq({ order: by }, 'replaceIn')}
          updateSortDir={() => sq({ direction: graph.sortDir === 'asc' ? 'desc' : 'asc' }, 'replaceIn')}
          expandAll={expandAll}
          groupBy={groupBy}
          collapseAll={collapseAll}
          setFullscreen={() => setFullscreen(true)}
          isFullscreen={showFullscreen}
          updateStatusFilter={(status: null | string) => setStatusFilter(status)}
          searchFieldProps={searchFieldProps}
          searchResults={searchResults}
          counts={counts}
        />
        {rows.length > 0 && (
          <div style={{ flex: '1', minHeight: '500px' }} ref={_listContainer}>
            <FixedListContainer
              onMouseDown={(e) => startMove(e.clientX)}
              onMouseUp={() => stopMove()}
              onMouseMove={(e) => move(e.clientX)}
              onMouseLeave={() => stopMove()}
              onTouchStart={(e) => startMove(e.touches[0].clientX)}
              onTouchEnd={() => stopMove()}
              onTouchMove={(e) => move(e.touches[0].clientX)}
              onTouchCancel={() => stopMove()}
              sticky={!!stickyHeader && groupBy.value}
              style={{
                height:
                  (listContainer.height - 69 > rows.length * ROW_HEIGHT
                    ? rows.length * ROW_HEIGHT
                    : listContainer.height - 69) + 'px',
                width: listContainer.width + 'px',
              }}
            >
              <List
                // eslint-disable-next-line react/no-string-refs
                ref={_listref}
                overscanRowCount={10}
                rowCount={rows.length}
                onRowsRendered={(params) => {
                  const stepNeedsSticky = timelineNeedStickyHeader(stepPositions, params.startIndex);

                  if (stepNeedsSticky) {
                    setStickyHeader(stepNeedsSticky.name);
                  } else {
                    if (stickyHeader) {
                      setStickyHeader(null);
                    }
                  }
                }}
                rowHeight={ROW_HEIGHT}
                rowRenderer={createRowRenderer({
                  rows,
                  graph,
                  dispatch: rowDataDispatch,
                  rowDataState: rowData,
                  isGroupped: groupBy.value,
                  t: t,
                })}
                height={listContainer.height - (stickyHeader ? ROW_HEIGHT : 0) - 69}
                width={listContainer.width}
              />

              {stickyHeader && groupBy.value && (
                <StickyHeader
                  stickyStep={stickyHeader}
                  items={rows}
                  graph={graph}
                  rowData={rowData[stickyHeader]}
                  onToggle={() => rowDataDispatch({ type: 'close', id: stickyHeader })}
                  t={t}
                />
              )}
            </FixedListContainer>

            <TimelineFooter
              graph={graph}
              rowData={rowData}
              move={(value) => graphDispatch({ type: 'move', value: value })}
              updateHandle={(which, to) => {
                if (which === 'left') {
                  graphDispatch({ type: 'setZoom', start: to < graph.min ? graph.min : to, end: graph.timelineEnd });
                } else {
                  graphDispatch({ type: 'setZoom', start: graph.timelineStart, end: to > graph.max ? graph.max : to });
                }
              }}
            />
          </div>
        )}
        {rows.length === 0 && status !== 'NotAsked' && (
          <ItemRow justify="center" margin="lg">
            <GenericError message={t('timeline.no-rows')} icon="listNotFound" />
          </ItemRow>
        )}
      </VirtualizedTimelineSubContainer>
    </VirtualizedTimelineContainer>
  );

  return showFullscreen ? (
    <FullPageContainer onClose={() => setFullscreen(false)}>{content}</FullPageContainer>
  ) : (
    content
  );
};

type RowRendererProps = {
  rows: Row[];
  graph: GraphState;
  dispatch: (action: RowDataAction) => void;
  rowDataState: RowDataModel;
  isGroupped: boolean;
  t: TFunction;
};

function createRowRenderer({ rows, graph, dispatch, rowDataState, isGroupped, t }: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <RowRenderer
        key={index}
        row={rows[index]}
        graph={graph}
        style={style}
        isGroupped={isGroupped}
        rowData={row.type === 'step' ? rowDataState[row.data.step_name] : undefined}
        toggleOpen={() => (row.type === 'step' ? dispatch({ type: 'toggle', id: row.data.step_name }) : () => null)}
        t={t}
      />
    );
  };
}

const RowRenderer: React.FC<{
  style: React.CSSProperties;
  row: Row;
  graph: GraphState;
  isGroupped: boolean;
  rowData?: StepRowData;
  toggleOpen?: () => void;
  t: TFunction;
}> = ({ style, row, graph, rowData, toggleOpen, isGroupped, t }) => {
  return (
    <div style={style}>
      <TimelineRow
        item={row}
        graph={graph}
        isGroupped={isGroupped}
        isOpen={rowData && rowData.isOpen}
        endTime={row.type === 'step' && rowData ? rowData.finished_at : undefined}
        onOpen={() => {
          if (row.type === 'task' || !toggleOpen) return;

          toggleOpen();
        }}
        t={t}
      />
    </div>
  );
};

const StickyHeader: React.FC<{
  stickyStep: string;
  items: Row[];
  graph: GraphState;
  rowData?: StepRowData;
  t: TFunction;
  onToggle: () => void;
}> = ({ stickyStep, items, graph, rowData, onToggle, t }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item) return null;

  return (
    <TimelineRow
      item={item}
      endTime={rowData && rowData.finished_at}
      isOpen={true}
      isGroupped={true}
      graph={graph}
      onOpen={onToggle}
      t={t}
      sticky
    />
  );
};

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;

  .ReactVirtualized__List:focus� {
    outline: none;
    border: none;
  }
`;

const VirtualizedTimelineSubContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FixedListContainer = styled.div<{ sticky?: boolean }>`
  position: relative;
  padding-top: ${(p) => (p.sticky ? ROW_HEIGHT : 0)}px;
`;

//
// Utils
//

function sortRows(sortBy: GraphSortBy, sortDir: 'asc' | 'desc') {
  return (a: Row, b: Row) => {
    const fst = sortDir === 'asc' ? a : b;
    const snd = sortDir === 'asc' ? b : a;

    if (sortBy === 'startTime' && fst.type === 'task' && snd.type === 'task') {
      return fst.data[0].ts_epoch - snd.data[0].ts_epoch;
    }
    if (sortBy === 'endTime' && fst.type === 'task' && snd.type === 'task') {
      return (fst.data[0].finished_at || 0) - (snd.data[0].finished_at || 0);
    } else if (sortBy === 'duration') {
      return taskDuration(fst) - taskDuration(snd);
    }

    return 0;
  };
}

function taskDuration(a: Row): number {
  if (a.type === 'task') {
    return a.data[0].duration || (a.data[0].finished_at ? a.data[0].finished_at - a.data[0].ts_epoch : 0);
  }
  return 0;
}

function findLongestTaskOfRow(step: StepRowData, graph: GraphState): number {
  return Object.keys(step.data).reduce((longestTaskValue, taskid) => {
    // There might be multiple tasks in same row since there might be retries. Find longest.
    const durationOfTasksInSameRow = step.data[taskid].reduce((value, task) => {
      return task.finished_at
        ? task.finished_at - task.ts_epoch > value
          ? task.finished_at - task.ts_epoch
          : value
        : value;
    }, 0);
    // Compare longest task to current longest
    if (graph.min + durationOfTasksInSameRow > longestTaskValue) {
      return graph.min + durationOfTasksInSameRow;
    }
    return longestTaskValue;
  }, 0);
}

function findHighestTimestampForGraph(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: Step[],
  groupBy: boolean,
): number {
  const visibleStepNames = visibleSteps.map((item) => item.step_name);
  return Object.keys(rowDataState).reduce((val, key) => {
    const step = rowDataState[key];
    // When we are sorting by start time, we can check just last step finish time
    if ((graph.sortBy === 'startTime' || graph.sortBy === 'endTime') && step.finished_at && step.finished_at > val) {
      if (visibleStepNames.indexOf(key) === -1) return val;
      return step.finished_at;
    }
    // When sorting by duration and grouping by step, we want to find longest step
    if (graph.sortBy === 'duration' && groupBy && step.finished_at) {
      if (visibleStepNames.indexOf(key) === -1) return val;
      return graph.min + step.duration > val ? graph.min + step.duration : val;
    }
    // When sorting by duration and grouping by none (so just tasks) we want to find longest task
    if (graph.sortBy === 'duration' && !groupBy && step.finished_at) {
      const longestTask = findLongestTaskOfRow(step, graph);

      if (longestTask > val) {
        return longestTask;
      }
    }
    return val;
  }, graph.min);
}

function shouldApplySearchFilter(results: SearchResultModel) {
  return results.status !== 'NotAsked';
}

function makeVisibleRows(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: Step[],
  statusFilter: string | null,
  searchResults: SearchResultModel,
  groupBy: boolean,
) {
  const matchIds = searchResults.result.map((item) => item.task_id);

  return visibleSteps.reduce((arr: Row[], current: Step): Row[] => {
    const rowData = rowDataState[current.step_name];
    // If step row is open, add its tasks to the list.
    if (rowData?.isOpen || !groupBy) {
      let rowTasks = Object.keys(rowData.data).map((item) => ({
        type: 'task' as const,
        data: rowData.data[item],
      }));

      if (statusFilter) {
        rowTasks = rowTasks.filter((item) =>
          statusFilter === 'done'
            ? item.data.find((task) => task.finished_at)
            : item.data.find((task) => !task.finished_at),
        );
      }

      if (shouldApplySearchFilter(searchResults)) {
        rowTasks = rowTasks.filter((item) => matchIds.indexOf(item.data[0]?.task_id) > -1);
      }

      return rowTasks.length === 0
        ? arr
        : arr.concat(
            groupBy ? [{ type: 'step' as const, data: current }] : [],
            groupBy ? rowTasks.sort(sortRows(graph.sortBy, graph.sortDir)) : rowTasks,
          );
    }

    // Add step if we are grouping.
    if (groupBy) {
      return arr.concat([{ type: 'step', data: current }]);
    }

    return [];
  }, []);
}

function timelineNeedStickyHeader(stepPositions: StepIndex[], currentIndex: number) {
  return stepPositions.find((item, index) => {
    const isLast = index + 1 === stepPositions.length;

    if (item.index < currentIndex && (isLast || stepPositions[index + 1].index > currentIndex + 1)) {
      return true;
    }
    return false;
  });
}

export default VirtualizedTimeline;
