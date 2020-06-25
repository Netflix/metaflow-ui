import React, { useEffect, useState, createRef, useRef, useReducer } from 'react';
import { /*AutoSizer,*/ List /* ScrollParams*/ } from 'react-virtualized';
import { Step, Task } from '../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import HorizontalScrollbar from './TimelineHorizontalScroll';
import TimelineRow from './TimelineRow';
import useResource from '../hooks/useResource';

export type GraphState = {
  // Relative or absolute rendering? Absolute = just line length
  mode: 'relative' | 'absolute';
  // Minimum value in graph
  min: number;
  // Maximum length of graph
  max: number;
  // Selected starting point (default to 0)
  timelineStart: number;
  // Selected ending point (default to last task timestamp)
  timelineEnd: number;
};

type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // Tasks for this step
  data: Task[];
};

function makeGraph(mode: 'relative' | 'absolute', start: number, end: number): GraphState {
  return {
    mode: mode,
    min: start,
    max: end,
    timelineStart: start,
    timelineEnd: end,
  };
}

export const ROW_HEIGHT = 28;

type RowDataAction =
  | { type: 'init'; ids: string[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'fill'; data: Task[] }
  | { type: 'open'; id: string }
  | { type: 'close'; id: string };

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
        const isOpenValue = state[value.step_name] ? state[value.step_name].isOpen : true;

        if (obj[value.step_name]) {
          return {
            ...obj,
            [value.step_name]: {
              isOpen: isOpenValue,
              data: [...obj[value.step_name].data, value].sort((a, b) => a.ts_epoch - b.ts_epoch),
            },
          };
        }
        return { ...obj, [value.step_name]: { isOpen: isOpenValue, data: [value] } };
      }, {});

      return { ...state, ...data };
    }
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
}> = ({ runNumber, flowId }) => {
  if (!runNumber || !flowId) {
    return <>Waiting for run data...</>;
  }

  return <VirtualizedTimeline runNumber={runNumber} flowId={flowId} />;
};

/**
 *
 */
const VirtualizedTimeline: React.FC<{
  flowId: string;
  runNumber: string;
}> = ({ flowId, runNumber }) => {
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef(null);
  const listContainer = useComponentSize(_listContainer);

  const [rows, setRows] = useState<Row[]>([]);
  // Actual step data. Sorted by ts_epoch
  const [steps, setSteps] = useState<Step[]>([]);
  // Position of each step in timeline. Used to track if we should use sticky header
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);

  const [rowDataState, dispatch] = useReducer(rowDataReducer, {});

  const { data: taskData } = useResource<Task[]>({
    url: `/flows/${flowId}/runs/${runNumber}/tasks?_limit=10000`,
    subscribeToEvents: `/flows/${flowId}/runs/${runNumber}/tasks`,
    initialData: [],
  });

  const { data: stepData } = useResource<Step[]>({
    url: `/flows/${flowId}/runs/${runNumber}/steps?_limit=1000`,
    subscribeToEvents: `/flows/${flowId}/runs/${runNumber}/steps`,
    initialData: [],
  });

  // Graph data. Need to know start and end time of run to render lines
  const [graph, setGraph] = useState<GraphState>({
    mode: 'absolute',
    min: 0,
    max: 10,
    timelineStart: 0,
    timelineEnd: 0,
  });

  // Init graph
  useEffect(() => {
    // Let's check start and end times for graph so we can draw proper lines
    if (steps.length > 1) {
      const start = steps[0].ts_epoch;
      const end = steps[steps.length - 1].ts_epoch;

      setGraph(makeGraph(graph.mode, start, end));
    } else if (steps && steps.length === 1) {
      // If only one step, lets just add some time
      setGraph(makeGraph(graph.mode, steps[0].ts_epoch, steps[0].ts_epoch + 2000));
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

    const highestTimestamp = taskData.reduce((val, task) => {
      if (task.ts_epoch > val) return task.ts_epoch;
      return val;
    }, graph.max);

    if (highestTimestamp !== graph.max) {
      setGraph(makeGraph(graph.mode, graph.min, highestTimestamp));
    }
  }, [taskData]);

  // Mode selection change. We need to calculate new graph values if mode changes
  // TODO find longest task for absolute mode (or relative? which one?)
  useEffect(() => {
    if (steps.length === 0) {
      return;
    }
    if (graph.mode === 'relative') {
      const start = steps[0].ts_epoch;
      const end = steps[steps.length - 1].ts_epoch;
      setGraph(makeGraph(graph.mode, start, end));
    } else {
      const start = steps[0].ts_epoch;
      const end = steps[steps.length - 1].ts_epoch;
      setGraph(makeGraph(graph.mode, start, end));
    }
  }, [graph.mode]); // eslint-disable-line

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
  }, [steps, rowDataState]);

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

  //
  // Scrollbar functions
  //

  const moveScrollbar = (value: number) => {
    // Check if any of the edges of scroll bar are out of bounds
    if (startOrEndOutOfBounds(graph, value)) {
      setGraph({
        ...graph,
        timelineStart: startOutOfBounds(graph, value)
          ? graph.min
          : graph.max - (graph.timelineEnd - graph.timelineStart),
        timelineEnd: endOutOfBounds(graph, value) ? graph.max : graph.min + (graph.timelineEnd - graph.timelineStart),
      });
    } else {
      // Other wise just change start and end position of scrollbar
      setGraph(updateGraph(graph, value));
    }
  };

  const zoomOut = () => {
    const tenthOfTimeline = (graph.max - graph.min) / 10;

    if (zoomOverTotalLength(graph, tenthOfTimeline)) {
      setGraph(resetTimeline(graph));
    } else if (startOrEndOutOfBounds(graph, -tenthOfTimeline, tenthOfTimeline)) {
      setGraph({
        ...graph,
        timelineStart: startOutOfBounds(graph, -tenthOfTimeline)
          ? graph.min
          : graph.max - (graph.timelineEnd - graph.timelineStart + tenthOfTimeline),
        timelineEnd: endOutOfBounds(graph, tenthOfTimeline)
          ? graph.max
          : graph.min + (graph.timelineEnd - graph.timelineStart + tenthOfTimeline),
      });
    } else {
      setGraph(updateGraph(graph, -tenthOfTimeline, tenthOfTimeline));
    }
  };

  const zoomIn = () => {
    const tenthOfTimeline = (graph.max - graph.min) / 10;

    if (graph.timelineEnd - tenthOfTimeline <= graph.timelineStart + tenthOfTimeline) return;

    setGraph(updateGraph(graph, tenthOfTimeline, -tenthOfTimeline));
  };

  return (
    <VirtualizedTimelineContainer>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div>
          <button onClick={() => expandAll()}>Expand all</button>
          <button onClick={() => collapseAll()}>Collapse all</button>
          <button
            onClick={() => {
              setGraph({ ...graph, mode: 'relative' });
            }}
          >
            relative
          </button>
          <button
            onClick={() => {
              setGraph({ ...graph, mode: 'absolute' });
            }}
          >
            absolute
          </button>
          <button onClick={zoomOut}>-</button>
          <button onClick={zoomIn}>+</button>
        </div>
        <div style={{ flex: '1' }} ref={_listContainer}>
          <div
            style={{
              position: 'relative',
              paddingTop: '28px',
              height: listContainer.height - 28 + 'px',
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
                      onOpen={() => {
                        if (row.type === 'task') return;

                        const step = rowDataState[row.data.step_name];

                        if (step && step.isOpen) {
                          dispatch({ type: 'close', id: row.data.step_name });
                        } else {
                          dispatch({ type: 'open', id: row.data.step_name });
                        }
                      }}
                    />
                  </div>
                );
              }}
              height={listContainer.height - 28}
              width={listContainer.width}
            />

            {stickyHeader && (
              <TimelineRow
                item={rows.find((item) => item.type === 'step' && item.data.step_name === stickyHeader)}
                graph={graph}
                onOpen={() => dispatch({ type: 'close', id: stickyHeader })}
                sticky
              />
            )}
          </div>
        </div>
        <GraphFooter>
          <HorizontalScrollbar graph={graph} updateTimeline={moveScrollbar} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{Math.round((graph.timelineStart - graph.min) / 1000)}s</div>
            <div>{Math.round((graph.timelineEnd - graph.min) / 1000)}s</div>
          </div>
        </GraphFooter>
      </div>
    </VirtualizedTimelineContainer>
  );
};

// Zoom functions
function zoomOverTotalLength(graph: GraphState, change: number) {
  return graph.timelineEnd + change - graph.timelineStart - change > graph.max - graph.min;
}

function startOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineStart + change < graph.min;
}

function endOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineEnd + change > graph.max;
}

function startOrEndOutOfBounds(graph: GraphState, change: number, changeEnd?: number) {
  return startOutOfBounds(graph, change) || endOutOfBounds(graph, changeEnd || change);
}

function updateGraph(graph: GraphState, change: number, changeEnd?: number): GraphState {
  return {
    ...graph,
    timelineStart: graph.timelineStart + change,
    timelineEnd: graph.timelineEnd + (changeEnd || change),
  };
}

function resetTimeline(graph: GraphState): GraphState {
  return {
    ...graph,
    timelineStart: graph.min,
    timelineEnd: graph.max,
  };
}

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const GraphFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 150px;
`;

export default VirtualizedTimeline;
