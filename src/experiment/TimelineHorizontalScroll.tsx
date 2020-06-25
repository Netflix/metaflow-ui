import React, { createRef, useState } from 'react';

import { GraphState } from './VirtualizedTimeline';
import styled from 'styled-components';

const HorizontalScrollbar: React.FC<{ graph: GraphState; updateTimeline: (amount: number) => void }> = ({
  graph,
  updateTimeline,
}) => {
  const _container = createRef<HTMLDivElement>();
  const [drag, setDrag] = useState({ dragging: false, start: 0 });

  return (
    <ScrollbarContainer ref={_container}>
      <ScrollDragContainer
        style={{
          position: drag.dragging ? 'fixed' : 'absolute',
        }}
        onMouseMove={(e) => {
          if (drag.dragging) {
            if (_container && _container.current) {
              const movement = (e.clientX - drag.start) / _container.current?.clientWidth;
              setDrag({ ...drag, start: e.clientX });
              updateTimeline((graph.max - graph.min) * movement);
            }
          }
        }}
        onMouseUp={() => {
          setDrag({ dragging: false, start: 0 });
        }}
        onMouseLeave={() => {
          setDrag({ dragging: false, start: 0 });
        }}
      />

      <ScrollBarHandle
        onMouseDown={(e) => {
          setDrag({ ...drag, dragging: true, start: e.clientX });
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
