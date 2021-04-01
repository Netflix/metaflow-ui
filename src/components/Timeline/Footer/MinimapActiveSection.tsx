import React from 'react';
import styled from 'styled-components';
import { formatDuration } from '../../../utils/format';
import { TimelineMetrics } from '../Timeline';
import MinimapHandle from './MinimapHandle';

//
// Typedef
//

type ActiveSectionProps = {
  timeline: TimelineMetrics;
  dragging: boolean;
  startMove: (value: number) => void;
  startHandleMove: (which: 'left' | 'right') => void;
};

//
// Component
//

const MinimapActiveSection: React.FC<ActiveSectionProps> = ({ timeline, dragging, startMove, startHandleMove }) => {
  const width = ((timeline.visibleEndTime - timeline.visibleStartTime) / (timeline.endTime - timeline.startTime)) * 100;
  const left = ((timeline.visibleStartTime - timeline.startTime) / (timeline.endTime - timeline.startTime)) * 100;

  return (
    <MiniTimelineActiveSection
      dragging={dragging}
      style={{
        width: width + '%',
        left: left + '%',
      }}
      onMouseDown={(e) => startMove(e.clientX)}
      onTouchStart={(e) => startMove(e.touches[0].clientX)}
    >
      <MinimapHandle
        which="left"
        isZoomed={width < 20}
        label={
          timeline.visibleStartTime <= timeline.startTime
            ? '0.0s'
            : formatDuration(timeline.visibleStartTime - timeline.startTime)
        }
        onDragStart={() => startHandleMove('left')}
      />
      <MinimapHandle
        which="right"
        isZoomed={width < 20}
        stackText={width + left > 90}
        label={formatDuration(timeline.visibleEndTime - timeline.startTime)}
        onDragStart={() => startHandleMove('right')}
      />
    </MiniTimelineActiveSection>
  );
};

//
// Style
//

const MiniTimelineActiveSection = styled.div<{ dragging: boolean }>`
  position: relative;
  height: 3.0625rem;
  background #fff;
  border-left: ${(p) => p.theme.border.thinLight};
  border-right: ${(p) => p.theme.border.thinLight};
  border-bottom: 0.5rem solid ${(p) => p.theme.color.border.light};
  cursor: grab;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s left, 0.5s width')};
`;

export default MinimapActiveSection;
