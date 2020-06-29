import React, { useEffect, useState, createRef, useRef, useReducer } from 'react';
import { /*AutoSizer,*/ List /* ScrollParams*/ } from 'react-virtualized';
import { Step, Task } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import HorizontalScrollbar from './TimelineHorizontalScroll';
import TimelineRow from './TimelineRow';
import useResource from '../../hooks/useResource';
import useGraph, { GraphState } from './useGraph';

export const ROW_HEIGHT = 28;

//
// Row data handling
//

type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // We have to compute finished_at value so let it live in here now :(
  finished_at: number;
  // Tasks for this step
  data: Task[];
};

type RowDataAction =
  | { type: 'init'; ids: string[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'fill'; data: Task[] }
  | { type: 'toggle'; id: string }
  | { type: 'open'; id: string }
  | { type: 'close'; id: string }
  | { type: 'sort'; ids: string[] };

function rowDataReducer(state: { [key: string]: StepRowData }, action: RowDataAction): { [key: string]: StepRowData } {
  switch (action.type) {
    case 'init':
      return action.ids.reduce((obj, id) => {
        if (state[id]) {
          return { ...obj, [id]: { ...state[id], isOpen: true } };
        }
        return { ...obj, [id]: { isOpen: true, data: [] } };
      }, {});
    case 'add':
      return { ...state, [action.id]: action.data };
    case 'fill': {
      const data = action.data.reduce((obj: { [key: string]: StepRowData }, value) => {
        const existingObject = state[value.step_name];
        const isOpenValue = existingObject ? existingObject.isOpen : true;

        if (obj[value.step_name]) {
          const row = obj[value.step_name];
          return {
            ...obj,
            [value.step_name]: {
              isOpen: isOpenValue,
              finished_at:
                row.finished_at < value.finished_at || row.finished_at < value.ts_epoch
                  ? value.finished_at || value.ts_epoch
                  : row.finished_at,
              data: [...row.data, value],
            },
          };
        }

        return {
          ...obj,
          [value.step_name]: { isOpen: isOpenValue, finished_at: value.finished_at || value.ts_epoch, data: [value] },
        };
      }, {});

      return { ...state, ...data };
    }
    case 'sort':
      return Object.keys(state).reduce((obj, value) => {
        if (action.ids.indexOf(value) > -1) {
          return {
            ...obj,
            [value]: { ...state[value], data: state[value].data.sort((a, b) => a.ts_epoch - b.ts_epoch) },
          };
        }

        return obj;
      }, state);
    case 'toggle':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: !state[action.id].isOpen } };
      }
      return state;
    case 'open':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: true } };
      }
      return state;
    case 'close':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: false } };
      }
      return state;
  }

  return state;
}

export type Row = { type: 'step'; data: Step } | { type: 'task'; data: Task };

type StepIndex = { name: string; index: number };

export const TimelineContainer: React.FC<{
  flowId: string;
  runNumber: string;
  realTime: boolean;
}> = ({ runNumber, flowId, realTime }) => {
  if (!runNumber || !flowId) {
    return <>Waiting for run data...</>;
  }

  return <VirtualizedTimeline runNumber={runNumber} flowId={flowId} realTime={realTime} />;
};

/**
 *
 */
const VirtualizedTimeline: React.FC<{
  flowId: string;
  runNumber: string;
  realTime: boolean;
}> = ({ flowId, runNumber, realTime }) => {
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef(null);
  const listContainer = useComponentSize(_listContainer);

  // Rows to be iterated in timeline
  const [rows, setRows] = useState<Row[]>([]);
  // Actual step data.
  const [steps, setSteps] = useState<Step[]>([]);
  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  // Data about step rows and their children.
  const [rowDataState, dispatch] = useReducer(rowDataReducer, {});

  const { data: taskData } = useResource<Task[], Task>({
    url: `/flows/${flowId}/runs/${runNumber}/tasks?_order=+ts_epoch&_limit=1000`,
    subscribeToEvents: `/flows/${flowId}/runs/${runNumber}/tasks`,
    initialData: [],
    updatePredicate: (a, b) => a.task_id === b.task_id,
  });

  const { data: stepData } = useResource<Step[], Step>({
    url: `/flows/${flowId}/runs/${runNumber}/steps?_order=+ts_epoch&_limit=1000`,
    subscribeToEvents: `/flows/${flowId}/runs/${runNumber}/steps`,
    initialData: [],
  });

  // Graph data. Need to know start and end time of run to render lines
  const { graph, dispatch: graphDispatch } = useGraph();
  // Init graph
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

  // Update steps data when they come in
  useEffect(() => {
    setSteps(stepData.sort((a, b) => a.ts_epoch - b.ts_epoch));
    dispatch({ type: 'init', ids: stepData.map((item) => item.step_name) });
  }, [stepData]); // eslint-disable-line

  // Update Tasks data when they come in
  useEffect(() => {
    if (!Array.isArray(taskData)) return;

    dispatch({ type: 'fill', data: taskData });
    dispatch({ type: 'sort', ids: Object.keys(rowDataState) });

    const highestTimestamp = taskData.reduce((val, task) => {
      if (task.finished_at && task.finished_at > val) return task.finished_at;
      if (task.ts_epoch > val) return task.ts_epoch;
      return val;
    }, graph.max);

    if (highestTimestamp !== graph.max && !realTime) {
      graphDispatch({ type: 'updateMax', end: highestTimestamp });
    }
  }, [taskData]);

  // Add tasks after step rows if they are open
  useEffect(() => {
    const newRows: Row[] = steps.reduce((arr: Row[], current: Step): Row[] => {
      const rowData = rowDataState[current.step_name];

      if (rowData?.isOpen) {
        return [
          ...arr,
          { type: 'step', data: current },
          ...rowData.data.map((item) => ({
            type: 'task' as const,
            data: item,
          })),
        ];
      }

      return [...arr, { type: 'step', data: current }];
    }, []);
    setRows(newRows);
  }, [rowDataState]);

  // Update step position indexes (for sticky headers)
  useEffect(() => {
    const stepPos: StepIndex[] = rows.reduce((arr: StepIndex[], current: Row, index: number) => {
      if (current.type === 'step') {
        return [...arr, { name: current.data.step_name, index: index }];
      }
      return arr;
    }, []);
    setStepPositions(stepPos);
  }, [rows]);

  const expandAll = () => {
    steps.forEach((item) => {
      dispatch({ type: 'open', id: item.step_name });
    });
  };

  const collapseAll = () => {
    steps.forEach((item) => {
      dispatch({ type: 'close', id: item.step_name });
    });
  };

  return (
    <VirtualizedTimelineContainer>
      <VirtualizedTimelineSubContainer>
        <div>
          <button onClick={() => expandAll()}>Expand all</button>
          <button onClick={() => collapseAll()}>Collapse all</button>
          <button onClick={() => graphDispatch({ type: 'mode', mode: 'relative' })}>relative</button>
          <button onClick={() => graphDispatch({ type: 'mode', mode: 'absolute' })}>absolute</button>
          <button onClick={() => graphDispatch({ type: 'zoomOut' })}>-</button>
          <button onClick={() => graphDispatch({ type: 'zoomIn' })}>+</button>
        </div>
        <div style={{ flex: '1' }} ref={_listContainer}>
          <FixedListContainer
            style={{
              height: listContainer.height - ROW_HEIGHT + 'px',
              width: listContainer.width + 'px',
            }}
          >
            <List
              // eslint-disable-next-line react/no-string-refs
              ref={_listref}
              overscanRowCount={10}
              rowCount={rows.length}
              onRowsRendered={(params) => {
                const stepNeedsSticky = stepPositions.find((item, index) => {
                  const isLast = index + 1 === stepPositions.length;

                  if (
                    item.index < params.startIndex &&
                    (isLast || stepPositions[index + 1].index > params.startIndex + 1)
                  ) {
                    return true;
                  }
                  return false;
                });

                if (stepNeedsSticky) {
                  setStickyHeader(stepNeedsSticky.name);
                } else {
                  if (stickyHeader) {
                    setStickyHeader(null);
                  }
                }
              }}
              rowHeight={ROW_HEIGHT}
              rowRenderer={({ index, style }) => {
                const row = rows[index];
                return (
                  <div key={index} style={style}>
                    <TimelineRow
                      item={row}
                      graph={graph}
                      endTime={
                        row.type === 'step' && rowDataState[row.data.step_name]
                          ? rowDataState[row.data.step_name].finished_at
                          : undefined
                      }
                      onOpen={() => {
                        if (row.type === 'task') return;

                        dispatch({ type: 'toggle', id: row.data.step_name });
                      }}
                    />
                  </div>
                );
              }}
              height={listContainer.height - 28}
              width={listContainer.width}
            />

            {stickyHeader && (
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
        <GraphFooter>
          <HorizontalScrollbar
            graph={graph}
            updateTimeline={(value) => graphDispatch({ type: 'move', value: value })}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{Math.round((graph.timelineStart - graph.min) / 1000)}s</div>
            <div>{Math.round((graph.timelineEnd - graph.min) / 1000)}s</div>
          </div>
        </GraphFooter>
      </VirtualizedTimelineSubContainer>
    </VirtualizedTimelineContainer>
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

  return <TimelineRow item={item} endTime={rowData && rowData.finished_at} graph={graph} onOpen={onToggle} sticky />;
};

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const VirtualizedTimelineSubContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const GraphFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 150px;
`;

const FixedListContainer = styled.div`
  position: relative;
  padding-top: ${ROW_HEIGHT}px;
`;

export default VirtualizedTimeline;
