import React, { useEffect, useState, createRef, useRef, useReducer } from 'react';
import { /*AutoSizer,*/ List /* ScrollParams*/ } from 'react-virtualized';
import { Step, Task } from '../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import HorizontalScrollbar from './TimelineHorizontalScroll';
import TimelineRow from './TimelineRow';

export type GraphState = {
  // Relative or absolute rendering? Absolute = just line length
  mode: 'relative' | 'absolute';
  // Minimum value in graph
  min: number;
  // Maximum length of graph
  max: number;
  // Period of graph (not really needed)
  period: number;
  // Selected starting point (default to 0)
  timelineStart: number;
  // Selected ending point (default to last task timestamp)
  timelineEnd: number;
};

type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // Tasks for this step
  taskData: { state: number; data: Task[] };
};

function makeGraph(mode: 'relative' | 'absolute', start: number, end: number): GraphState {
  return {
    mode: mode,
    min: start,
    max: end,
    period: end - start,
    timelineStart: start,
    timelineEnd: end,
  };
}

export const ROW_HEIGHT = 28;

type RowDataAction =
  | { type: 'init'; ids: string[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'close'; id: string };

function rowDataReducer(state: { [key: string]: StepRowData }, action: RowDataAction): { [key: string]: StepRowData } {
  switch (action.type) {
    case 'init':
      return action.ids.reduce((obj, id) => {
        return { ...obj, [id]: { isOpen: false, taskData: { state: 0, data: [] } } };
      }, {});
    case 'add':
      return { ...state, [action.id]: action.data };
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

/**
 *
 */
const VirtualizedTimeline: React.FC<{
  data: Step[];
  onOpen: (item: Step) => void;
}> = ({ data }) => {
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
  // List of row indexes that needs their height recalculated. Needs to be here so everything has time to render after changes
  // const [recomputeIds, setRecomputeIds] = useState<number[]>([]);

  const [rowDataState, dispatch] = useReducer(rowDataReducer, {});

  // Graph data. Need to know start and end time of run to render lines
  const [graph, setGraph] = useState<GraphState>({
    mode: 'absolute',
    min: 0,
    max: 10,
    period: 10,
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

  // Init steps list when data changes (needs sorting)
  useEffect(() => {
    setSteps(data.sort((a, b) => a.ts_epoch - b.ts_epoch));
    dispatch({ type: 'init', ids: data.map((item) => item.step_name) });
  }, [data]); // eslint-disable-line

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

  // Open row
  const openRow = (id: string, forceOpen?: boolean) => {
    const step = steps.find((item) => item.step_name === id);
    const item = rowDataState[id];

    if (!step) {
      return;
    }

    /**
     * Handle what happens when row is clicked. Few situations
     * a) Row is closed -> Close it
     * b) Row is opened for first time -> Create row metadata for object and
     * fetch tasks
     * c) Row is opened (not first time) -> Open and show already fetched tasks
     */

    const row = {
      isOpen: forceOpen ? true : item ? !item.isOpen : true,
      taskData: item ? item.taskData : { state: 0, data: [] },
    };

    // Update open state
    dispatch({
      type: 'add',
      id,
      data: row,
    });

    if (row.taskData.state === 0) {
      fetch(`/flows/${step.flow_id}/runs/${step.run_number}/steps/${step.step_name}/tasks`).then((resp) => {
        resp.json().then((data: Task[]) => {
          dispatch({
            type: 'add',
            id,
            data: {
              ...row,
              taskData: { state: 1, data: data.sort((a, b) => a.ts_epoch - b.ts_epoch) },
            },
          });
        });
      });
    }
  };

  const expandAll = () => {
    steps.forEach((step) => {
      openRow(step.step_name, true);
    });
  };

  const collapseAll = () => {
    steps.forEach((item) => {
      dispatch({ type: 'close', id: item.step_name });
    });
  };

  // Map steps to rows. TODO: This might clash with task rows thing
  useEffect(() => {
    setRows(
      steps.map((item) => ({
        type: 'step',
        data: item,
      })),
    );
  }, [steps]);

  // Add tasks after step rows if they are open
  useEffect(() => {
    const newRows: Row[] = steps.reduce((arr: Row[], current: Step): Row[] => {
      const rowData = rowDataState[current.step_name];

      if (rowData?.isOpen && rowData.taskData.state === 1) {
        return [
          ...arr,
          { type: 'step', data: current },
          ...rowData.taskData.data.map((item) => ({
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

  // Scrollbar functions
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
                    <TimelineRow item={row} graph={graph} onOpen={() => openRow(row.data.step_name)} />
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
                onOpen={() => openRow(stickyHeader)}
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
