import React, { createRef, useState } from 'react';

import { GraphState } from './useGraph';
import styled from 'styled-components';

//
// Scrollbar for horizontal scrolling (moving in time).
// NOTE: This element might want feature to zoom in to some specific point.
// TODO: Touch support
//
const HorizontalScrollbar: React.FC<{ graph: GraphState; updateTimeline: (amount: number) => void }> = ({
  graph,
  updateTimeline,
}) => {
  const _container = createRef<HTMLDivElement>();
  const [drag, setDrag] = useState({ dragging: false, start: 0 });

  const move = (clientX: number) => {
    if (drag.dragging) {
      if (_container && _container.current) {
        const movement = (clientX - drag.start) / _container.current?.clientWidth;
        setDrag({ ...drag, start: clientX });
        updateTimeline((graph.max - graph.min) * movement);
      }
    }
  };

  const startMove = (clientX: number) => {
    setDrag({ ...drag, dragging: true, start: clientX });
  };

  const stopMove = () => {
    setDrag({ dragging: false, start: 0 });
  };

  return (
    <ScrollbarContainer ref={_container}>
      <ScrollDragContainer
        style={{
          // This container is extended to cover whole page when dragging so we can keep track of mouse moving
          // even when mouse leaves actual scrollbar
          position: drag.dragging ? 'fixed' : 'absolute',
        }}
        onMouseMove={(e) => {
          move(e.clientX);
        }}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchMove={(e) => {
          move(e.touches[0].clientX);
        }}
        onTouchEnd={stopMove}
        onTouchCancel={stopMove}
      />

      <ScrollBarHandle
        onMouseDown={(e) => {
          startMove(e.clientX);
        }}
        onTouchStart={(e) => {
          startMove(e.touches[0].clientX);
        }}
        style={{
          pointerEvents: drag.dragging ? 'none' : 'all',
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

const ScrollDragContainer = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ScrollBarHandle = styled.div`
  min-width: 10px;
  height: 8px;
  background-color: #dadada;
  position: absolute;
  top: 8px;
`;

export default HorizontalScrollbar;
