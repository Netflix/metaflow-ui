import React, { useEffect, useState } from 'react';
import Collapsable from '../../../components/Collapsable';
import Timeline, { ROW_HEIGHT, SPACE_UNDER_TIMELINE } from '../../../components/Timeline/Timeline';
import useTaskData from '../../../components/Timeline/useTaskData';
import TimelineNoRows from '../../../components/Timeline/TimelineNoRows';
import { makeVisibleRows } from '../../Run/Run.utils';
import { startAndEndpointsOfRows } from '../../../utils/row';
import styled from 'styled-components';
import { Row } from '../../../components/Timeline/VirtualizedTimeline';
import { Run } from '../../../types';

//
// Typedef
//

type TimelinePreviewProps = {
  run: Run;
};

//
// Component
//

const TimelinePreview: React.FC<TimelinePreviewProps> = ({ run }) => {
  const { rows, steps, dispatch, taskStatus } = useTaskData(run.flow_id, run.run_number.toString());
  const [preview, setPreview] = useState<{ start: number; end: number; visiblerows: Row[] } | null>(null);

  useEffect(() => {
    const stepNames = steps.map((s) => s.step_name);
    const visiblerows = makeVisibleRows(rows, { group: true, sort: ['startTime', 'asc'] }, stepNames);
    const { start, end } = startAndEndpointsOfRows(visiblerows);
    setPreview((state) => ({ start, end: state ? Math.max(end, state.end) : end, visiblerows }));
  }, [rows, steps]);

  return (
    <Collapsable title="Timeline" initialState={true}>
      <TimelinePreviewContainer>
        {preview && preview.visiblerows.length > 0 && (
          <Timeline
            rows={preview.visiblerows}
            timeline={{
              startTime: run.ts_epoch,
              endTime: run.finished_at || preview.end,
              visibleEndTime: run.finished_at || preview.end,
              visibleStartTime: run.ts_epoch,
              sortBy: 'startTime',
              groupingEnabled: false,
            }}
            footerType="minimal"
            customMinimumHeight={
              preview.visiblerows.length > 10
                ? 20
                : (ROW_HEIGHT * preview.visiblerows.length + SPACE_UNDER_TIMELINE('minimal')) / 16
            }
            onStepRowClick={(stepid) => dispatch({ type: 'toggle', id: stepid })}
          />
        )}
        {(!preview || (preview && preview.visiblerows.length === 0)) && (
          <TimelineNoRows
            counts={{ all: 0, failed: 0, running: 0, completed: 0, unknown: 0, pending: 0 }}
            searchStatus="NotAsked"
            tasksStatus={taskStatus}
          />
        )}
      </TimelinePreviewContainer>
    </Collapsable>
  );
};

//
// Style
//

const TimelinePreviewContainer = styled.div`
  max-height: 30rem;
  margin-top: 1rem;
  border-top: ${(p) => p.theme.border.mediumLight};
`;

export default TimelinePreview;
