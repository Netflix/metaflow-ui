import React, { useCallback, useState } from 'react';
import { Step, Task, AsyncStatus, Run } from '../../types';
import styled from 'styled-components';
import { StepRowData, RowDataAction } from './useTaskData';
import { RowCounts } from './taskdataUtils';
import FullPageContainer from '../FullPageContainer';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import TaskListingHeader from '../TaskListingHeader';
import TimelineNoRows from './TimelineNoRows';
import Timeline from './Timeline';
import useTimelineControls from './useTimelineControls';
import { TaskListMode, TaskSettingsQueryParameters, TaskSettingsState } from './useTaskListSettings';
import { SetQuery } from 'use-query-params';

//
// Typedef
//

export type StepRow = { type: 'step'; data: Step; rowObject: StepRowData };
export type TaskRow = { type: 'task'; data: Task[] };
export type Row = StepRow | TaskRow;
type TimelineProps = {
  run: Run;
  rows: Row[];
  rowDataDispatch: React.Dispatch<RowDataAction>;
  taskStatus: AsyncStatus;
  counts: RowCounts;
  settings: TaskSettingsState;
  searchField: SearchFieldReturnType;
  paramsString: string;
  setQueryParam: SetQuery<TaskSettingsQueryParameters>;
  isAnyGroupOpen: boolean;
  onModeSelect: (mode: TaskListMode) => void;
};

//
// Component
//

const VirtualizedTimeline: React.FC<TimelineProps> = ({
  run,
  settings,
  rows,
  rowDataDispatch,
  taskStatus: status,
  counts,
  searchField,
  paramsString,
  setQueryParam,
  isAnyGroupOpen,
  onModeSelect,
}) => {
  const [showFullscreen, setFullscreen] = useState(false);
  const { timelineControls, dispatch: timelineControlDispatch } = useTimelineControls(
    run,
    rows,
    settings.sort[0] === 'duration' ? 'left' : 'startTime',
  );

  //
  // Event handling
  //

  const footerHandleUpdate = useCallback(
    (which: 'left' | 'right', to: number) => {
      if (which === 'left') {
        timelineControlDispatch({
          type: 'setZoom',
          start:
            to < timelineControls.min
              ? timelineControls.min
              : to > timelineControls.timelineEnd - 500
              ? timelineControls.timelineStart
              : to,
          end: timelineControls.timelineEnd,
        });
      } else {
        timelineControlDispatch({
          type: 'setZoom',
          start: timelineControls.timelineStart,
          end:
            to > timelineControls.max
              ? timelineControls.max
              : to < timelineControls.timelineStart + 500
              ? timelineControls.timelineEnd
              : to,
        });
      }
    },
    [
      timelineControlDispatch,
      timelineControls.max,
      timelineControls.min,
      timelineControls.timelineEnd,
      timelineControls.timelineStart,
    ],
  );

  const zoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') {
      timelineControlDispatch({ type: 'zoomIn' });
    } else if (type === 'out') {
      timelineControlDispatch({ type: 'zoomOut' });
    } else if (type === 'reset') {
      timelineControlDispatch({ type: 'resetZoom' });
    }
  };

  const handleStepRowClick = useCallback(
    (stepid: string) => rowDataDispatch({ type: 'toggle', id: stepid }),
    [rowDataDispatch],
  );

  const handleMove = useCallback(
    (value: number) => timelineControlDispatch({ type: 'move', value: value }),
    [timelineControlDispatch],
  );

  const handleToggleCollapse = (type: 'expand' | 'collapse') =>
    rowDataDispatch({ type: type === 'expand' ? 'openAll' : 'closeAll' });

  const handleSetFullScreen = () => setFullscreen(true);

  const content = (
    <VirtualizedTimelineContainer style={showFullscreen ? { padding: '0 1rem' } : {}}>
      <VirtualizedTimelineSubContainer>
        <TaskListingHeader
          run={run}
          settings={settings}
          isFullscreen={showFullscreen}
          searchField={searchField}
          counts={counts}
          isAnyGroupOpen={isAnyGroupOpen}
          setQueryParam={setQueryParam}
          onModeSelect={onModeSelect}
          onSetFullscreen={handleSetFullScreen}
          onZoom={zoom}
          userZoomed={timelineControls.controlled}
          onToggleCollapse={handleToggleCollapse}
        />
        {rows.length > 0 && (
          <Timeline
            rows={rows}
            timeline={{
              startTime: timelineControls.min,
              endTime: timelineControls.max,
              visibleStartTime: timelineControls.timelineStart,
              visibleEndTime: timelineControls.timelineEnd,
              sortBy: settings.sort[0],
              groupingEnabled: settings.group,
            }}
            paramsString={paramsString}
            searchStatus={searchField.results.status}
            onHandleMove={footerHandleUpdate}
            onMove={handleMove}
            onStepRowClick={handleStepRowClick}
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
