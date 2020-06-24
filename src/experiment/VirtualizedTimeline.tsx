import React, { useEffect, useState, createRef, useRef, useReducer } from 'react';
import { /*AutoSizer,*/ List /* ScrollParams*/ } from 'react-virtualized';
import { Step, Task } from '../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import { color } from '../utils/theme';

type GraphState = {
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

const ROW_HEIGH = 28;

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

type Row = { type: 'step'; data: Step } | { type: 'task'; data: Task };

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
        resp.json().then((data) => {
          dispatch({
            type: 'add',
            id,
            data: {
              ...row,
              taskData: { state: 1, data },
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

  useEffect(() => {
    setRows(
      steps.map((item) => ({
        type: 'step',
        data: item,
      })),
    );
  }, [steps]);

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

  useEffect(() => {
    const stepPos: StepIndex[] = rows.reduce((arr: StepIndex[], current: Row, index: number) => {
      if (current.type === 'step') {
        return [...arr, { name: current.data.step_name, index: index }];
      }
      return arr;
    }, []);
    setStepPositions(stepPos);
  }, [rows]);

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
          <button
            onClick={() => {
              const tenthOfTimeline = (graph.max - graph.min) / 10;
              setGraph({
                ...graph,
                timelineStart: graph.timelineStart - tenthOfTimeline,
                timelineEnd: graph.timelineEnd + tenthOfTimeline,
              });
            }}
          >
            -
          </button>
          <button
            onClick={() => {
              const tenthOfTimeline = (graph.max - graph.min) / 10;
              setGraph({
                ...graph,
                timelineStart: graph.timelineStart + tenthOfTimeline,
                timelineEnd: graph.timelineEnd - tenthOfTimeline,
              });
            }}
          >
            +
          </button>
          <div className="heading" style={{ position: 'relative', height: '30px' }}></div>
        </div>
        <div style={{ flex: '1' }} ref={_listContainer}>
          <div style={{ position: 'relative', height: listContainer.height + 'px', width: listContainer.width + 'px' }}>
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
              rowHeight={ROW_HEIGH}
              rowRenderer={({ index, style }) => {
                const row = rows[index];
                return (
                  <div key={index} style={style}>
                    <TimelineRow item={row} graph={graph} onOpen={() => openRow(row.data.step_name)} />
                  </div>
                );
              }}
              height={listContainer.height}
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
          <HorizontalScrollbar
            graph={graph}
            updateTimeline={(value) => {
              const isStartOutOfBounds = graph.timelineStart + value < graph.min;
              const isEndOutOfBounds = graph.timelineEnd + value > graph.max;

              if (isStartOutOfBounds) {
                setGraph({
                  ...graph,
                  timelineStart: graph.min,
                  timelineEnd: graph.min + (graph.timelineEnd - graph.timelineStart),
                });
              } else if (isEndOutOfBounds) {
                setGraph({
                  ...graph,
                  timelineStart: graph.max - (graph.timelineEnd - graph.timelineStart),
                  timelineEnd: graph.max,
                });
              } else {
                setGraph({
                  ...graph,
                  timelineStart: graph.timelineStart + value,
                  timelineEnd: graph.timelineEnd + value,
                });
              }
            }}
          />
          <div>
            <div>{Math.round((graph.timelineStart - graph.min) / 1000)}s</div>
            <div>{Math.round((graph.timelineEnd - graph.min) / 1000)}s</div>
          </div>
        </GraphFooter>
      </div>
    </VirtualizedTimelineContainer>
  );
};

const TimelineRow: React.FC<{
  item?: Row;
  graph: GraphState;
  onOpen: () => void;
  sticky?: boolean;
}> = ({ item, graph, onOpen, sticky }) => {
  if (!item) return null;

  const dataItem = item.data;

  const Element = sticky ? StickyStyledRow : StyledRow;

  return (
    <>
      <Element
        style={{
          background:
            dataItem.ts_epoch < graph.timelineStart || dataItem.ts_epoch > graph.timelineEnd ? '#f8f8f8' : '#fff',
        }}
      >
        <RowLabel onClick={() => onOpen()} style={{ cursor: 'pointer' }}>
          {item.type === 'task' ? item.data.task_id : dataItem.step_name}
        </RowLabel>
        <RowGraphContainer>
          <BoxGraphic
            style={{
              left:
                graph.mode === 'relative'
                  ? 0
                  : `${((dataItem.ts_epoch - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100}%`,
            }}
          ></BoxGraphic>
        </RowGraphContainer>
      </Element>
    </>
  );
};

const HorizontalScrollbar: React.FC<{ graph: GraphState; updateTimeline: (amount: number) => void }> = ({
  graph,
  updateTimeline,
}) => {
  const _container = createRef<HTMLDivElement>();
  const [drag, setDrag] = useState({ dragging: false, start: 0 });

  return (
    <ScrollbarContainer
      ref={_container}
      onMouseMove={(e) => {
        if (drag.dragging) {
          if (_container && _container.current) {
            const movement = (e.clientX - drag.start) / _container.current?.clientWidth;
            setDrag({ ...drag, start: e.clientX });
            updateTimeline((graph.max - graph.min) * movement);
          }
        }
      }}
      onMouseUp={() => {
        setDrag({ dragging: false, start: 0 });
      }}
    >
      <ScrollBarHandle
        onMouseDown={(e) => {
          setDrag({ ...drag, dragging: true, start: e.clientX });
        }}
        style={{
          width: ((graph.timelineEnd - graph.timelineStart) / (graph.max - graph.min)) * 100 + '%',
          left: ((graph.timelineStart - graph.min) / (graph.max - graph.min)) * 100 + '%',
        }}
      />
    </ScrollbarContainer>
  );
};

const ScrollbarContainer = styled.div`
  width: 100%;
  height: 24px;
  position: relative;
`;

const ScrollBarHandle = styled.div`
  min-width: 10px;
  height: 8px;
  background-color: #dadada;
  position: absolute;
  top: 8px;
`;

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  min-height: ${ROW_HEIGH}px;
  border-bottom: 1px solid #e8e8e8;
  transition: background 0.15s;

  &:hover {
    background: #e8e8e8;
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
`;

const RowLabel = styled.div`
  flex: 0 0 150px;
  text-align: right;
  padding: 10px 10px 0;
  font-size: 14px;
`;

const RowGraphContainer = styled.div`
  position: relative;
  width: 100%;
  border-left: 1px solid #e8e8e8;
  overflow-x: hidden;
`;

const BoxGraphic = styled.div`
  position: absolute;
  background: ${color('secondary')};
  min-width: 100px;
  height: 16px;
  transform: translateY(7px);
`;

const GraphFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 150px;
`;

export default VirtualizedTimeline;
