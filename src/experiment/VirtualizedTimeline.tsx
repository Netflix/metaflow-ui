import React, { useEffect, useState, createRef, useReducer } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { Step, Task } from '../types';
import styled from 'styled-components';

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
  | { type: 'init'; indexes: number[] }
  | { type: 'add'; index: number; data: StepRowData }
  | { type: 'close'; index: number };

function rowDataReducer(state: { [key: number]: StepRowData }, action: RowDataAction): { [key: number]: StepRowData } {
  switch (action.type) {
    case 'init':
      return action.indexes.reduce((obj, index) => {
        return { ...obj, [index]: { isOpen: false, taskData: { state: 0, data: [] } } };
      }, {});
    case 'add':
      return { ...state, [action.index]: action.data };
    case 'close':
      if (state[action.index]) {
        return { ...state, [action.index]: { ...state[action.index], isOpen: false } };
      }
      return state;
  }

  return state;
}

/**
 *
 */
const VirtualizedTimeline: React.FC<{
  data: Step[];
  onOpen: (item: Step) => void;
}> = ({ data }) => {
  const _listref = createRef<List>();
  // Actual step data. Sorted by ts_epoch
  const [steps, setSteps] = useState<Step[]>([]);
  // List of row indexes that needs their height recalculated. Needs to be here so everything has time to render after changes
  const [recomputeIds, setRecomputeIds] = useState<number[]>([]);

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
    // setRowData([]);
    dispatch({ type: 'init', indexes: data.map((_, index) => index) });
  }, [data]); // eslint-disable-line

  // Force height calculations for given rows
  useEffect(() => {
    if (recomputeIds.length > 0) {
      recomputeIds.forEach((id) => {
        if (_listref.current) {
          _listref.current.recomputeRowHeights(id);
        }
      });
    }
  }, [recomputeIds]); // eslint-disable-line

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
  /*
  useEffect(() => {
    setRowData({ ...rowData, ...updateArray });
  }, [updateArray]);*/
  /*
  const updateRowData = (key: number, data: StepRowData) => {
    setRowData({
      ...rowData,
      [key]: data,
    });
  };
*/
  // Open row
  const openRow = (index: number, forceOpen?: boolean) => {
    const item = rowDataState[index];

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
      index,
      data: row,
    });

    const step = steps[index];

    if (row.taskData.state === 0) {
      fetch(`/flows/${step.flow_id}/runs/${step.run_number}/steps/${step.step_name}/tasks`).then((resp) => {
        resp.json().then((data) => {
          dispatch({
            type: 'add',
            index,
            data: {
              ...row,
              taskData: { state: 1, data },
            },
          });

          setRecomputeIds([...recomputeIds, index]);
        });
      });
    }

    setRecomputeIds([...recomputeIds, index]);
  };

  const expandAll = () => {
    steps.forEach((_, index) => {
      openRow(index, true);
    });
    setRecomputeIds([...recomputeIds, ...steps.map((_, index) => index)]);
  };

  const collapseAll = () => {
    steps.forEach((_, index) => {
      dispatch({ type: 'close', index });
    });
    setRecomputeIds([...recomputeIds, ...steps.map((_, index) => index)]);
  };

  return (
    <VirtualizedTimelineContainer>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        <div className="heading" style={{ position: 'relative', height: '30px' }}></div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <>
              <List
                // eslint-disable-next-line react/no-string-refs
                ref={_listref}
                autoHeight={true}
                overscanRowCount={15}
                rowCount={steps.length}
                rowHeight={({ index }) => {
                  // Need to think how this should work
                  // If there is million tasks, maybe we have maximum height and virtualise that stuff?
                  if (rowDataState[index]) {
                    const item = rowDataState[index];
                    return item.isOpen
                      ? item.taskData.state === 1
                        ? ROW_HEIGH +
                          (item.taskData.data.length * ROW_HEIGH > 300 ? 300 : item.taskData.data.length * ROW_HEIGH)
                        : ROW_HEIGH * 2
                      : ROW_HEIGH;
                  }
                  return ROW_HEIGH;
                }}
                rowRenderer={({ index, style }) => (
                  <div key={index} style={style}>
                    <TimelineRow
                      item={steps[index]}
                      graph={graph}
                      rowData={rowDataState[index]}
                      onOpen={() => openRow(index)}
                    />
                  </div>
                )}
                height={steps.length * ROW_HEIGH}
                width={width}
              />
            </>
          )}
        </AutoSizer>
        <GraphFooter>
          <div>{Math.round((graph.timelineStart - graph.min) / 1000)}s</div>
          <div>{Math.round((graph.timelineEnd - graph.min) / 1000)}s</div>
        </GraphFooter>
        <input
          type="number"
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val || val === 0) {
              setGraph({
                ...graph,
                timelineStart: graph.min + val * 1000,
              });
            }
          }}
        />
        <input
          type="number"
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val || val === 0) {
              setGraph({
                ...graph,
                timelineEnd: graph.min + val * 1000,
              });
            }
          }}
        />
        <button
          onClick={() =>
            setGraph({
              ...graph,
              timelineStart: graph.min,
              timelineEnd: graph.max,
            })
          }
        >
          reset
        </button>
      </div>
    </VirtualizedTimelineContainer>
  );
};

const TimelineRow: React.FC<{ item: Step; graph: GraphState; onOpen: () => void; rowData?: StepRowData }> = ({
  item,
  graph,
  onOpen,
  rowData,
}) => {
  return (
    <>
      <Row
        style={{
          opacity: item.ts_epoch < graph.timelineStart || item.ts_epoch > graph.timelineEnd ? 0.5 : 1,
        }}
      >
        <RowLabel onClick={() => onOpen()} style={{ cursor: 'pointer' }}>
          {item.step_name}
        </RowLabel>
        <RowGraphContainer>
          <BoxGraphic
            style={{
              left:
                graph.mode === 'relative'
                  ? 0
                  : `${((item.ts_epoch - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100}%`,
            }}
          ></BoxGraphic>
        </RowGraphContainer>
      </Row>

      <TimelineTasksList data={rowData} graph={graph} parentTime={item.ts_epoch} />
    </>
  );
};

const TimelineTasksList: React.FC<{ data?: StepRowData; graph: GraphState; parentTime: number }> = ({
  data,
  graph,
  parentTime,
}) => {
  const _listref = createRef<List>();

  if (!data || !data.isOpen) {
    return null;
  }

  if (data.taskData.state === 0) {
    return <Row>loading</Row>;
  } else {
    const items = data.taskData.data;
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            // eslint-disable-next-line react/no-string-refs
            ref={_listref}
            overscanRowCount={15}
            rowCount={items.length}
            rowHeight={ROW_HEIGH}
            rowRenderer={({ index, style }) => (
              <div key={index} style={style}>
                <Row>
                  <RowLabel>{items[index].task_id}</RowLabel>
                  <RowGraphContainer>
                    <BoxGraphic
                      style={{
                        left:
                          graph.mode === 'relative'
                            ? 0
                            : `${
                                ((parentTime - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100
                              }%`,
                        minWidth: '50px',
                      }}
                    ></BoxGraphic>
                  </RowGraphContainer>
                </Row>
              </div>
            )}
            height={items.length * ROW_HEIGH > 300 ? 300 : items.length * ROW_HEIGH}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }
};

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  min-height: ${ROW_HEIGH}px;
  border-bottom: 1px solid #e8e8e8;
  transition: background 0.15s;

  &:hover {
    background: #e8e8e8;
  }
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
  background: ${p => p.theme.color.bg.teal};
  min-width: 100px;
  height: 16px;
  transform: translateY(7px);
`;

const GraphFooter = styled.div`
  display: flex;
  width: 100%;
  padding-left: 150px;
  justify-content: space-between;
`;

export default VirtualizedTimeline;
