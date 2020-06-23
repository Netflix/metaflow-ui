import React, { useEffect, useState, createRef, useRef, useReducer } from 'react';
import { /*AutoSizer,*/ List, ScrollParams } from 'react-virtualized';
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

/**
 *
 */
const VirtualizedTimeline: React.FC<{
  data: Step[];
  onOpen: (item: Step) => void;
}> = ({ data }) => {
  const _listref = createRef<List>();
  const _listContainer = useRef(null);
  let listContainer = useComponentSize(_listContainer);

  const [rows, setRows] = useState<Row[]>([]);
  // Actual step data. Sorted by ts_epoch
  const [steps, setSteps] = useState<Step[]>([]);
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
    // setRowData([]);
    dispatch({ type: 'init', ids: data.map((item) => item.step_name) });
  }, [data]); // eslint-disable-line

  // Force height calculations for given rows
  /*
  useEffect(() => {
    if (recomputeIds.length > 0) {
      recomputeIds.forEach((id) => {
        if (_listref.current) {
          _listref.current.recomputeRowHeights(id);
        }
      });
    }
  }, [recomputeIds]); // eslint-disable-line
*/
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

          // setRecomputeIds([...recomputeIds, index]);
        });
      });
    }

    // setRecomputeIds([...recomputeIds, index]);
  };

  const expandAll = () => {
    steps.forEach((step) => {
      openRow(step.step_name, true);
    });
    // setRecomputeIds([...recomputeIds, ...steps.map((_, index) => index)]);
  };

  const collapseAll = () => {
    steps.forEach((item) => {
      dispatch({ type: 'close', id: item.step_name });
    });
    // setRecomputeIds([...recomputeIds, ...steps.map((_, index) => index)]);
  };
  const subRowMaxHeight = listContainer.height - ROW_HEIGH;

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
          <div className="heading" style={{ position: 'relative', height: '30px' }}></div>
        </div>
        <div style={{ flex: '1' }} ref={_listContainer}>
          <div style={{ position: 'relative', height: listContainer.height + 'px', width: listContainer.width + 'px' }}>
            <List
              // eslint-disable-next-line react/no-string-refs
              ref={_listref}
              overscanRowCount={15}
              rowCount={rows.length}
              onScroll={(params: ScrollParams) => console.log(params)}
              rowHeight={(_props) => {
                // Need to think how this should work
                // If there is million tasks, maybe we have maximum height and virtualise that stuff?
                /*if (rowDataState[index]) {
                  const item = rowDataState[index];
                  return item.isOpen
                    ? item.taskData.state === 1
                      ? ROW_HEIGH +
                        (item.taskData.data.length * ROW_HEIGH > subRowMaxHeight
                          ? subRowMaxHeight
                          : item.taskData.data.length * ROW_HEIGH)
                      : ROW_HEIGH * 2
                    : ROW_HEIGH;
                }*/
                return ROW_HEIGH;
              }}
              rowRenderer={({ index, style }) => {
                const row = rows[index];
                return (
                  <div key={index} style={style}>
                    <TimelineRow
                      item={row}
                      graph={graph}
                      maxHeight={subRowMaxHeight}
                      rowData={{ isOpen: false, taskData: { state: 1, data: [] } }}
                      onOpen={() => openRow(row.data.step_name)}
                    />
                  </div>
                );
              }}
              height={listContainer.height /*steps.length * ROW_HEIGH*/}
              width={listContainer.width}
            />
            <StyledRow style={{ position: 'absolute', background: '#fff', top: 0, left: 0 }}>
              <RowLabel>Absolute row</RowLabel>
            </StyledRow>
          </div>
        </div>
        <GraphFooter>
          <div>{Math.round((graph.timelineStart - graph.min) / 1000)}s</div>
          <div>{Math.round((graph.timelineEnd - graph.min) / 1000)}s</div>
        </GraphFooter>
      </div>
    </VirtualizedTimelineContainer>
  );
};

const TimelineRow: React.FC<{
  item: Row;
  graph: GraphState;
  maxHeight: number;
  onOpen: () => void;
  rowData?: StepRowData;
}> = ({ item, graph, onOpen, maxHeight, rowData }) => {
  const dataItem = item.data;
  return (
    <>
      <StyledRow
        style={{
          opacity: dataItem.ts_epoch < graph.timelineStart || dataItem.ts_epoch > graph.timelineEnd ? 0.5 : 1,
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
      </StyledRow>

      <TimelineTasksList data={rowData} graph={graph} maxHeight={maxHeight} parentTime={dataItem.ts_epoch} />
    </>
  );
};

const TimelineTasksList: React.FC<{ data?: StepRowData; graph: GraphState; maxHeight: number; parentTime: number }> = ({
  data,
  // graph,
  // maxHeight,
  // parentTime,
}) => {
  // const _listref = createRef<List>();

  if (!data || !data.isOpen) {
    return null;
  }

  if (data.taskData.state === 0) {
    return <StyledRow>loading</StyledRow>;
  } else {
    // const items = data.taskData.data;
    return null /*(
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
            height={items.length * ROW_HEIGH > maxHeight ? maxHeight : items.length * ROW_HEIGH}
            width={width}
          />
        )}
      </AutoSizer>
    )*/;
  }
};

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
  width: 100%;
  padding-left: 150px;
  justify-content: space-between;
`;

export default VirtualizedTimeline;
