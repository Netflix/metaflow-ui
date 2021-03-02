import React from 'react';
import styled from 'styled-components';
import { formatDuration } from '../../../utils/format';
import { GraphState } from '../useGraph';
import MinimapHandle from './MinimapHandle';

//
// Typedef
//

type ActiveSectionProps = {
  graph: GraphState;
  dragging: boolean;
  startMove: (value: number) => void;
  startHandleMove: (which: 'left' | 'right') => void;
};

//
// Component
//

const MinimapActiveSection: React.FC<ActiveSectionProps> = ({ graph, dragging, startMove, startHandleMove }) => {
  const width = ((graph.timelineEnd - graph.timelineStart) / (graph.max - graph.min)) * 100;
  const left = ((graph.timelineStart - graph.min) / (graph.max - graph.min)) * 100;

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
        label={graph.timelineStart <= graph.min ? '0.0s' : formatDuration(graph.timelineStart - graph.min)}
        onDragStart={() => startHandleMove('left')}
      />
      <MinimapHandle
        which="right"
        isZoomed={width < 20}
        stackText={width + left > 90}
        label={formatDuration(graph.timelineEnd - graph.min)}
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
  height: 49px;
  background #fff;
  border-left: ${(p) => p.theme.border.thinLight};
  border-right: ${(p) => p.theme.border.thinLight};
  border-bottom: 8px solid ${(p) => p.theme.color.border.light};
  cursor: grab;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s left, 0.5s width')};
`;

export default MinimapActiveSection;
