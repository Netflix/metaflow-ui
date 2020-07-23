import React, { useEffect, useState, createRef, useRef } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, Run } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import TimelineRow from './TimelineRow';
import useResource from '../../hooks/useResource';
import useGraph, { GraphState, GraphSortBy, validatedParameter } from './useGraph';
import useRowData, { StepRowData, RowDataAction, RowDataModel } from './useRowData';
import { useTranslation } from 'react-i18next';
import TimelineHeader from './TimelineHeader';
import TimelineFooter from './TimelineFooter';
import { useQueryParams, StringParam } from 'use-query-params';

export const ROW_HEIGHT = 28;
export type Row = { type: 'step'; data: Step } | { type: 'task'; data: Task[] };
type StepIndex = { name: string; index: number };

//
// Container component for timeline. We might wanna show different states here if we havent
// gotten run data yet.
//
export const TimelineContainer: React.FC<{ run?: Run | null }> = ({ run }) => {
  const { t } = useTranslation();
  if (!run || !run.run_number) {
    return <>{t('timeline.no-run-data')}</>;
  }

  return <VirtualizedTimeline run={run} />;
};

type TimelineFilters = {
  steps: string[];
  tasks: string[];
};

function sortRows(sortBy: GraphSortBy, sortDir: 'asc' | 'desc') {
  return (a: Row, b: Row) => {
    const fst = sortDir === 'asc' ? a : b;
    const snd = sortDir === 'asc' ? b : a;

    if (sortBy === 'startTime' && fst.type === 'task' && snd.type === 'task') {
      return fst.data[0].ts_epoch - snd.data[0].ts_epoch;
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

//
// Self containing component for rendering everything related to timeline. Component fetched (and subscribes for live events) steps and tasks from different
// endpoints. View is supposed to be full page (and full page only) since component itself will use virtualised scrolling.
//
const VirtualizedTimeline: React.FC<{
  run: Run;
}> = ({ run }) => {
  const [q, sq] = useQueryParams({
    group: StringParam,
    order: StringParam,
    direction: StringParam,
    alignment: StringParam,
    steps: StringParam,
  });
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef<HTMLDivElement>(null);
  const listContainer = useComponentSize(_listContainer);

  // Rows to be iterated in timeline
  const [rows, setRows] = useState<Row[]>([]);
  // Actual step data.
  // const [steps, setSteps] = useState<Step[]>([]);
  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  // Data about step rows and their children. Each rowDataState item is step row and in its data property you will find
  // tasks belonging to it.
  const { rows: rowDataState, dispatch } = useRowData();

  //
  // Data fetching
  //

  // Fetch & subscribe to steps
  useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: true,
    initialData: [],
    onUpdate: (items) => {
      dispatch({ type: 'fillStep', data: items });
    },
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fullyDisableCache: true,
  });

  // Fetch & subscribe to tasks
  useResource<Task[], Task>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/tasks`,
    subscribeToEvents: true,
    initialData: [],
    updatePredicate: (a, b) => a.task_id === b.task_id,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fetchAllData: true,
    onUpdate: (items) => {
      dispatch({ type: 'fillTasks', data: items });
    },
    fullyDisableCache: true,
    useBatching: true,
  });

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

    const sortBy = validatedParameter<'startTime' | 'duration'>(
      q.order,
      graph.sortBy,
      ['startTime', 'duration'],
      'startTime',
    );
    if (sortBy) {
      graphDispatch({ type: 'sortBy', by: sortBy });
    }

    const groupBy = validatedParameter<'none' | 'step'>(q.group, graph.groupBy, ['none', 'step'], 'step');
    if (groupBy) {
      graphDispatch({ type: 'groupBy', by: groupBy });
    }

    const alignment = validatedParameter<'fromStartTime' | 'fromLeft'>(
      q.alignment,
      graph.alignment,
      ['fromStartTime', 'fromLeft'],
      'fromStartTime',
    );
    if (alignment) {
      graphDispatch({ type: 'alignment', alignment });
    }
  }, [q, graph, graphDispatch]);

  // Init graph when steps updates (do we need this?)
  /*
  useEffect(() => {
    // Let's check start and end times for graph so we can draw proper lines
    if (steps.length > 1) {
      const start = steps[0].ts_epoch;

      const highestTimestamp = steps.reduce((val, step) => {
        if (step.ts_epoch > val) return step.ts_epoch;
        return val;
      }, graph.max);

      graphDispatch({ type: 'init', start, end: highestTimestamp });
    } else if (steps && steps.length === 1) {
      // If only one step, lets just add some time
      graphDispatch({ type: 'init', start: steps[0].ts_epoch, end: steps[0].ts_epoch + 2000 });
    }
  }, [steps]); // eslint-disable-line
*/
  //
  // Data processing
  //

  // Figure out rows that should be visible if something related to that changes
  // This is not most performant way to do this so we might wanna update these functionalities later on.
  useEffect(() => {
    // Filter out steps if we have step filters on. Also filter out all steps starting with underscore (_)
    // since they are created by metaflow and unnecessary for user
    const steps: Step[] = Object.keys(rowDataState)
      .map((key) => rowDataState[key].step)
      .filter((item): item is Step => item !== undefined);
    const visibleSteps = (filters.steps.length === 0
      ? steps
      : steps.filter((step) => filters.steps.indexOf(step.step_name) > -1)
    ).filter((item) => item.step_name && !item.step_name.startsWith('_'));

    // Make list of rows. Note that in list steps and tasks are equal rows, they are just rendered a bit differently
    const newRows: Row[] = visibleSteps.reduce((arr: Row[], current: Step): Row[] => {
      const rowData = rowDataState[current.step_name];
      // If step row is open, add its tasks to the list.
      if (rowData?.isOpen || graph.groupBy === 'none') {
        const rowTasks = Object.keys(rowData.data).map((item) => ({
          type: 'task' as const,
          data: rowData.data[parseInt(item)],
        }));
        return arr.concat(
          graph.groupBy === 'step' ? [{ type: 'step' as const, data: current }] : [],
          graph.groupBy === 'step' ? rowTasks.sort(sortRows(graph.sortBy, graph.sortDir)) : rowTasks,
        );
      }

      // Add step if we are grouping.
      if (graph.groupBy === 'step') {
        return arr.concat([{ type: 'step', data: current }]);
      }

      return [];
    }, []);

    if (visibleSteps.length > 0) {
      // Find last point in timeline. We could do this somewhere else.. Like in useRowData reducer
      const highestTimestamp = Object.keys(rowDataState).reduce((val, key) => {
        const step = rowDataState[key];
        if (step.finished_at && step.finished_at > val) return step.finished_at;
        return val;
      }, 0);

      graphDispatch({ type: 'init', start: visibleSteps[0].ts_epoch, end: highestTimestamp });
    }

    const rowsToUpdate = graph.groupBy === 'none' ? newRows.sort(sortRows(graph.sortBy, graph.sortDir)) : newRows;

    // If no grouping, sort tasks here.
    setRows(rowsToUpdate);
  }, [rowDataState, graphDispatch, filters.steps, graph.groupBy, graph.sortBy, graph.sortDir]);

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
    dispatch({ type: 'reset' });
    graphDispatch({ type: 'reset' });
  }, [run.run_number, dispatch, graphDispatch]);

  //
  // Button behaviour
  //

  const expandAll = () => {
    Object.keys(rowDataState).forEach((stepName) => {
      dispatch({ type: 'open', id: stepName });
    });
  };

  const collapseAll = () => {
    Object.keys(rowDataState).forEach((stepName) => {
      dispatch({ type: 'close', id: stepName });
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
    setDrag({ dragging: false, start: 0 });
  };

  return (
    <VirtualizedTimelineContainer>
      <VirtualizedTimelineSubContainer>
        <TimelineHeader
          graph={graph}
          zoom={(dir) => graphDispatch({ type: dir === 'out' ? 'zoomOut' : 'zoomIn' })}
          zoomReset={() => graphDispatch({ type: 'resetZoom' })}
          changeMode={(alignment) => sq({ alignment })}
          toggleGroupBy={(by) => sq({ group: by })}
          updateSortBy={(by) => sq({ order: by })}
          updateSortDir={() => sq({ direction: graph.sortDir === 'asc' ? 'desc' : 'asc' })}
          expandAll={expandAll}
          collapseAll={collapseAll}
        />
        <div style={{ flex: '1' }} ref={_listContainer}>
          <FixedListContainer
            onMouseDown={(e) => startMove(e.clientX)}
            onMouseUp={() => stopMove()}
            onMouseMove={(e) => move(e.clientX)}
            onMouseLeave={() => stopMove()}
            onTouchStart={(e) => startMove(e.touches[0].clientX)}
            onTouchEnd={() => stopMove()}
            onTouchMove={(e) => move(e.touches[0].clientX)}
            onTouchCancel={() => stopMove()}
            sticky={!!stickyHeader && graph.groupBy !== 'none'}
            style={{
              height:
                (listContainer.height < window.innerHeight * 0.6 ? window.innerHeight * 0.6 : listContainer.height) +
                'px',
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
              rowRenderer={createRowRenderer({ rows, graph, dispatch, rowDataState })}
              height={listContainer.height + (stickyHeader ? 0 : ROW_HEIGHT) - 28}
              width={listContainer.width}
            />

            {stickyHeader && graph.groupBy === 'step' && (
              <StickyHeader
                stickyStep={stickyHeader}
                items={rows}
                graph={graph}
                rowData={rowDataState[stickyHeader]}
                onToggle={() => dispatch({ type: 'close', id: stickyHeader })}
              />
            )}
          </FixedListContainer>
        </div>
        <TimelineFooter graph={graph} move={(value) => graphDispatch({ type: 'move', value: value })} />
      </VirtualizedTimelineSubContainer>
    </VirtualizedTimelineContainer>
  );
};

type RowRendererProps = {
  rows: Row[];
  graph: GraphState;
  dispatch: (action: RowDataAction) => void;
  rowDataState: RowDataModel;
};

function createRowRenderer({ rows, graph, dispatch, rowDataState }: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <RowRenderer
        key={index}
        row={rows[index]}
        graph={graph}
        style={style}
        rowData={row.type === 'step' ? rowDataState[row.data.step_name] : undefined}
        toggleOpen={() => (row.type === 'step' ? dispatch({ type: 'toggle', id: row.data.step_name }) : () => null)}
      />
    );
  };
}

const RowRenderer: React.FC<{
  style: React.CSSProperties;
  row: Row;
  graph: GraphState;
  rowData?: StepRowData;
  toggleOpen?: () => void;
}> = ({ style, row, graph, rowData, toggleOpen }) => {
  return (
    <div style={style}>
      <TimelineRow
        item={row}
        graph={graph}
        isOpen={rowData && rowData.isOpen}
        endTime={row.type === 'step' && rowData ? rowData.finished_at : undefined}
        onOpen={() => {
          if (row.type === 'task' || !toggleOpen) return;

          toggleOpen();
        }}
      />
    </div>
  );
};

const StickyHeader: React.FC<{
  stickyStep: string;
  items: Row[];
  graph: GraphState;
  rowData?: StepRowData;
  onToggle: () => void;
}> = ({ stickyStep, items, graph, rowData, onToggle }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item) return null;

  return (
    <TimelineRow
      item={item}
      endTime={rowData && rowData.finished_at}
      isOpen={true}
      graph={graph}
      onOpen={onToggle}
      sticky
    />
  );
};

function timelineNeedStickyHeader(stepPositions: StepIndex[], currentIndex: number) {
  return stepPositions.find((item, index) => {
    const isLast = index + 1 === stepPositions.length;

    if (item.index < currentIndex && (isLast || stepPositions[index + 1].index > currentIndex + 1)) {
      return true;
    }
    return false;
  });
}

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

  .ReactVirtualized__List:focus  {
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

export default VirtualizedTimeline;
