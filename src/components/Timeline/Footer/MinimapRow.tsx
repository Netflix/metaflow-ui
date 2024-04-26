import React from 'react';
import styled from 'styled-components';
import { TaskStatus } from '../../../types';
import { TimelineMetrics } from '../Timeline';
import { lineColor } from '../TimelineRow/utils';

//
// Typedef
//

type MinimapRowProps = {
  started: number;
  finished: number;
  status: TaskStatus;
  timeline: TimelineMetrics;
};

//
// Component
//
const MinimapRow: React.FC<MinimapRowProps> = ({ started, finished, status, timeline }) => {
  const extendAmount = (timeline.endTime - timeline.startTime) * 0.01;
  const visibleDuration = timeline.endTime - timeline.startTime + extendAmount;
  const width = ((finished - started) / visibleDuration) * 100;
  const left = timeline.sortBy === 'duration' ? 0 : ((started - timeline.startTime) / visibleDuration) * 100;

  return (
    <MinimapLine
      status={status}
      style={{
        width: width + '%',
        left: left + '%',
      }}
    ></MinimapLine>
  );
};

//
// Style
//

const MinimapLine = styled.div<{ status: TaskStatus }>`
  position: relative;
  background: ${(p) => lineColor(p.theme, false, p.status, true)};
  height: 2px;
  min-height: 2px;
  margin-bottom: 1px;
  min-width: 2px;
  transition:
    width 0.5s,
    left 0.5s;
`;

export default MinimapRow;
