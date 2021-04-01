import React, { useState } from 'react';
import { Step, Task, AsyncStatus } from '../../types';
import styled from 'styled-components';

import { GraphHook } from './useGraph';
import { StepRowData, RowDataAction } from './useTaskData';
import { RowCounts } from './taskdataUtils';
import FullPageContainer from '../FullPageContainer';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import TaskListingHeader from '../TaskListingHeader';
import TimelineNoRows from './TimelineNoRows';
import Timeline from './Timeline';

//
// Typedef
//

export type StepRow = { type: 'step'; data: Step; rowObject: StepRowData };
export type TaskRow = { type: 'task'; data: Task[] };
export type Row = StepRow | TaskRow;
type TimelineProps = {
  rows: Row[];
  rowDataDispatch: React.Dispatch<RowDataAction>;
  status: AsyncStatus;
  counts: RowCounts;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  paramsString: string;
  isAnyGroupOpen: boolean;
};

//
// Component
//

const VirtualizedTimeline: React.FC<TimelineProps> = ({
  graph: graphHook,
  rows,
  rowDataDispatch,
  status,
  counts,
  searchField,
  paramsString,
  isAnyGroupOpen,
}) => {
  const [showFullscreen, setFullscreen] = useState(false);
  const { graph, dispatch: graphDispatch, setQueryParam } = graphHook;

  //
  // Event handling
  //

  const footerHandleUpdate = (which: 'left' | 'right', to: number) => {
    if (which === 'left') {
      graphDispatch({
        type: 'setZoom',
        start: to < graph.min ? graph.min : to > graph.timelineEnd - 500 ? graph.timelineStart : to,
        end: graph.timelineEnd,
      });
    } else {
      graphDispatch({
        type: 'setZoom',
        start: graph.timelineStart,
        end: to > graph.max ? graph.max : to < graph.timelineStart + 500 ? graph.timelineEnd : to,
      });
    }
  };

  const content = (
    <VirtualizedTimelineContainer style={showFullscreen ? { padding: '0 1rem' } : {}}>
      <VirtualizedTimelineSubContainer>
        <TaskListingHeader
          graph={graphHook}
          expandAll={() => rowDataDispatch({ type: 'openAll' })}
          collapseAll={() => rowDataDispatch({ type: 'closeAll' })}
          setFullscreen={() => setFullscreen(true)}
          isFullscreen={showFullscreen}
          searchField={searchField}
          counts={counts}
          enableZoomControl
          isAnyGroupOpen={isAnyGroupOpen}
          hasStepFilter={graph.stepFilter.length > 0}
          resetSteps={() => setQueryParam({ steps: null })}
        />
        {rows.length > 0 && (
          <Timeline
            rows={rows}
            timeline={{
              startTime: graph.min,
              endTime: graph.max,
              visibleStartTime: graph.timelineStart,
              visibleEndTime: graph.timelineEnd,
              alignment: graph.alignment,
              sortBy: graph.sortBy,
              groupingEnabled: graph.group,
            }}
            paramsString={paramsString}
            onHandleMove={footerHandleUpdate}
            onMove={(value) => graphDispatch({ type: 'move', value: value })}
            onStepRowClick={(stepid) => rowDataDispatch({ type: 'toggle', id: stepid })}
          />
        )}

        {rows.length === 0 && (
          <TimelineNoRows searchStatus={searchField.results.status} tasksStatus={status} counts={counts} />
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

//
// Style
//

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  user-select: none;
`;

const VirtualizedTimelineSubContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default VirtualizedTimeline;
