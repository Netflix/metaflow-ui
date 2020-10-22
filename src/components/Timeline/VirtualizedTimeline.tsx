import React, { useEffect, useState, createRef, useRef } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, AsyncStatus } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import TimelineRow from './TimelineRow';
import { GraphHook, GraphState, GraphSortBy } from './useGraph';
import { StepRowData, RowDataAction, RowDataModel, RowCounts } from './useRowData';
import { useTranslation } from 'react-i18next';
import TimelineHeader from './TimelineHeader';
import TimelineFooter from './TimelineFooter';
import FullPageContainer from '../FullPageContainer';
import { SearchFieldReturnType, SearchResultModel } from '../../hooks/useSearchField';
import GenericError from '../GenericError';
import { ItemRow } from '../Structure';
import { TFunction } from 'i18next';
import Spinner from '../Spinner';

export const ROW_HEIGHT = 28;
export type Row = { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task[] };
type StepIndex = { name: string; index: number };

//
// Self containing component for rendering everything related to timeline. Component fetched (and subscribes for live events) steps and tasks from different
// endpoints. View is supposed to be full page (and full page only) since component itself will use virtualised scrolling.
//
type TimelineProps = {
  rows: Row[];
  steps: Step[];
  rowDataDispatch: React.Dispatch<RowDataAction>;
  status: AsyncStatus;
  counts: RowCounts;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  setMode: (str: string) => void;
};

const VirtualizedTimeline: React.FC<TimelineProps> = ({
  graph: graphHook,
  rows,
  steps,
  rowDataDispatch,
  status,
  counts,
  searchField,
  setMode,
}) => {
  const { t } = useTranslation();
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef<HTMLDivElement>(null);
  const listContainer = useComponentSize(_listContainer);

  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  const [showFullscreen, setFullscreen] = useState(false);
  const { graph, dispatch: graphDispatch, setQueryParam } = graphHook;

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

  //
  // Button behaviour
  //

  const expandAll = () => {
    /*
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'open', id: stepName });
    });
    */
  };

  const collapseAll = () => {
    /*
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'close', id: stepName });
    });
    */
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
          graph={graphHook}
          zoom={(dir) => graphDispatch({ type: dir === 'out' ? 'zoomOut' : 'zoomIn' })}
          zoomReset={() => graphDispatch({ type: 'resetZoom' })}
          setMode={setMode}
          expandAll={expandAll}
          collapseAll={collapseAll}
          setFullscreen={() => setFullscreen(true)}
          isFullscreen={showFullscreen}
          searchField={searchField}
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
              sticky={!!stickyHeader && graph.group}
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
                  isGrouped: graph.group,
                  t: t,
                })}
                height={listContainer.height - (stickyHeader ? ROW_HEIGHT : 0) - 69}
                width={listContainer.width}
              />

              {stickyHeader && graph.group && (
                <StickyHeader
                  stickyStep={stickyHeader}
                  items={rows}
                  graph={graph}
                  onToggle={() => rowDataDispatch({ type: 'close', id: stickyHeader })}
                  t={t}
                />
              )}
            </FixedListContainer>

            <TimelineFooter
              graph={graph}
              steps={steps}
              hasStepFilter={graph.stepFilter.length > 0}
              resetSteps={() => setQueryParam({ steps: null })}
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
        {rows.length === 0 && status !== 'NotAsked' && status !== 'Loading' && (
          <ItemRow justify="center" margin="lg">
            <GenericError message={t('timeline.no-rows')} icon="listNotFound" />
          </ItemRow>
        )}
        {rows.length === 0 && status === 'Loading' && (
          <ItemRow justify="center" margin="lg">
            <Spinner md />
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
  isGrouped: boolean;
  t: TFunction;
};

function createRowRenderer({ rows, graph, dispatch, isGrouped, t }: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <RowRenderer
        key={index}
        row={rows[index]}
        graph={graph}
        style={style}
        isGrouped={isGrouped}
        rowData={row.type === 'step' ? row.rowObject : undefined}
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
  isGrouped: boolean;
  rowData?: StepRowData;
  toggleOpen?: () => void;
  t: TFunction;
}> = ({ style, row, graph, rowData, toggleOpen, isGrouped, t }) => {
  return (
    <div style={style}>
      <TimelineRow
        item={row}
        graph={graph}
        isGrouped={isGrouped}
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
  t: TFunction;
  onToggle: () => void;
}> = ({ stickyStep, items, graph, onToggle, t }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item || item.type !== 'step') return null;

  return (
    <TimelineRow
      item={item}
      endTime={item.rowObject.finished_at}
      isOpen={true}
      isGrouped={true}
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

export function sortRows(sortBy: GraphSortBy, sortDir: 'asc' | 'desc'): (a: Row, b: Row) => number {
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

export function findHighestTimestampForGraph(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: Step[],
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
    if (graph.sortBy === 'duration' && graph.group && step.finished_at) {
      if (visibleStepNames.indexOf(key) === -1) return val;
      return graph.min + step.duration > val ? graph.min + step.duration : val;
    }
    // When sorting by duration and grouping by none (so just tasks) we want to find longest task
    if (graph.sortBy === 'duration' && !graph.group && step.finished_at) {
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

export function makeVisibleRows(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: Step[],
  searchResults: SearchResultModel,
) {
  const matchIds = searchResults.result.map((item) => item.task_id);

  return visibleSteps.reduce((arr: Row[], current: Step): Row[] => {
    const rowData = rowDataState[current.step_name];
    // If step row is open, add its tasks to the list.
    if (rowData?.isOpen || !graph.group) {
      let rowTasks = Object.keys(rowData.data).map((item) => ({
        type: 'task' as const,
        data: rowData.data[item],
      }));

      if (graph.statusFilter) {
        rowTasks = rowTasks.filter(
          (item) =>
            (graph.statusFilter === 'failed' && item.data.length > 1) ||
            item.data.find((task) => task.status === graph.statusFilter),
        );
      }

      if (shouldApplySearchFilter(searchResults)) {
        rowTasks = rowTasks.filter((item) => matchIds.indexOf(item.data[0]?.task_id) > -1);
      }

      return rowTasks.length === 0
        ? arr
        : arr.concat(
            graph.group ? [{ type: 'step' as const, data: current, rowObject: rowData }] : [],
            graph.group ? rowTasks.sort(sortRows(graph.sortBy, graph.sortDir)) : rowTasks,
          );
    }

    // If step row is closed, only add step (if grouping)
    if (graph.group) {
      return arr.concat([{ type: 'step', data: current, rowObject: rowData }]);
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
