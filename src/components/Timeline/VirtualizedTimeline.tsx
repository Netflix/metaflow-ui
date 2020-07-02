import React, { useEffect, useState, createRef, useRef, useCallback } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, Run } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import HorizontalScrollbar from './TimelineHorizontalScroll';
import TimelineRow from './TimelineRow';
import useResource from '../../hooks/useResource';
import useGraph, { GraphState } from './useGraph';
import useRowData, { StepRowData } from './useRowData';
import useQuery from '../../hooks/useQuery';
import { useHistory, useLocation } from 'react-router-dom';
import { getParamChangeHandler } from '../../utils/url';

export const ROW_HEIGHT = 28;
export type Row = { type: 'step'; data: Step } | { type: 'task'; data: Task };
type StepIndex = { name: string; index: number };

//
// Container component for timeline. We might wanna show different states here if we havent
// gotten run data yet.
//
export const TimelineContainer: React.FC<{ run: Run }> = ({ run }) => {
  if (!run || !run.run_number) {
    return <>No run data. You can wait to see if this run is to be created</>;
  }

  return <VirtualizedTimeline run={run} />;
};

type TimelineFilters = {
  steps: string[];
  tasks: string[];
};

//
// Self containing component for rendering everything related to timeline. Component fetched (and subscribes for live events) steps and tasks from different
// endpoints. View is supposed to be full page (and full page only) since component itself will use virtualised scrolling.
//
const VirtualizedTimeline: React.FC<{
  run: Run;
}> = ({ run }) => {
  const params = useQuery();
  const history = useHistory();
  const location = useLocation();
  const search = useCallback((qs: string) => history.push(`${location.pathname}?${qs}`), [history, location.pathname]);
  const handleParamChange = getParamChangeHandler(params, search, () => console.log('what?'));
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
  // Data about step rows and their children. Each rowDataState item is step row and in its data property you will find
  // tasks belonging to it.
  const { rows: rowDataState, dispatch } = useRowData();

  //
  // Data fetching
  //

  // Fetch & subscribe to steps
  const { data: stepData } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: `/flows/${run.flow_id}/runs/${run.run_number}/steps`,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  // Fetch & subscribe to tasks
  const { data: taskData } = useResource<Task[], Task>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/tasks`,
    subscribeToEvents: `/flows/${run.flow_id}/runs/${run.run_number}/tasks`,
    initialData: [],
    updatePredicate: (a, b) => a.task_id === b.task_id,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fetchAllData: true,
  });

  //
  // Local filterings
  //

  const [filters, setFilters] = useState<TimelineFilters>({ steps: [], tasks: [] });
  useEffect(() => {
    const stepFilters = params.get('steps');

    if (stepFilters) {
      setFilters({ ...filters, steps: stepFilters.split(',') });
    }
  }, [params.get('steps')]); // eslint-disable-line

  //
  // Graph measurements
  //

  // Graph data. Need to know start and end time of run to render lines
  const { graph, dispatch: graphDispatch } = useGraph(run.ts_epoch, run.finished_at || Date.now());

  // Init graph when steps updates (do we need this?)
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

  //
  // Data processing
  //

  // Update steps data when they come in
  useEffect(() => {
    setSteps(stepData.sort((a, b) => a.ts_epoch - b.ts_epoch));
    dispatch({ type: 'init', ids: stepData.map((item) => item.step_name) });
  }, [stepData]); // eslint-disable-line

  // Update Tasks data when they come in
  useEffect(() => {
    if (!Array.isArray(taskData)) return;

    dispatch({ type: 'fill', data: taskData });
    // dispatch({ type: 'sort', ids: Object.keys(rowDataState) });
  }, [taskData, dispatch]);

  // Add tasks after step rows if they are open
  useEffect(() => {
    const visibleSteps =
      filters.steps.length === 0 ? steps : steps.filter((step) => filters.steps.indexOf(step.step_name) > -1);
    const newRows: Row[] = visibleSteps.reduce((arr: Row[], current: Step): Row[] => {
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

    const highestTimestamp = Object.keys(rowDataState).reduce((val, key) => {
      const step = rowDataState[key];
      if (step.finished_at && step.finished_at > val) return step.finished_at;
      return val;
    }, 0);

    graphDispatch({ type: 'updateMax', end: highestTimestamp });

    setRows(newRows);
  }, [rowDataState, graphDispatch, steps, filters.steps]);

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
  // Button behaviour
  //

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
        <div style={{ display: 'flex' }}>
          <button onClick={() => expandAll()}>Expand all</button>
          <button onClick={() => collapseAll()}>Collapse all</button>
          <button onClick={() => graphDispatch({ type: 'mode', mode: 'relative' })}>relative</button>
          <button onClick={() => graphDispatch({ type: 'mode', mode: 'absolute' })}>absolute</button>
          <button onClick={() => graphDispatch({ type: 'zoomOut' })}>-</button>
          <button onClick={() => graphDispatch({ type: 'zoomIn' })}>+</button>
          <div style={{ display: 'flex' }}>
            <label>steps</label>
            <input
              defaultValue={filters.steps.join(',')}
              onKeyPress={(e) => {
                if (e.charCode === 13) {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleParamChange('steps', value, false);
                  } else {
                    handleParamChange('steps', '', false);
                  }
                }
              }}
            />
          </div>
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
