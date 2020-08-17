import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { GraphState } from './useGraph';
import HorizontalScrollbar from './TimelineHorizontalScroll';

type FooterDragState = {
  dragging: boolean;
  startPos: null | number;
  currentPos: null | number;
};

function getLeftValue(start: number | null, end: number | null): number {
  if (start && end) {
    return start > end ? end : start;
  }
  return 0;
}

function getWidthValue(start: number | null, end: number | null): number {
  if (start && end) {
    console.log(start > end ? start - end : start - end);
    return start > end ? start - end : end - start;
  }
  return 0;
}

const TimelineFooter: React.FC<{ graph: GraphState; move: (value: number) => void }> = ({ graph, move }) => {
  const [dragstate, setDragstate] = useState<FooterDragState>({
    dragging: false,
    startPos: null,
    currentPos: null,
  });
  const _container = useRef<HTMLDivElement>(null);

  const onDragStart = (clientX: number) => {
    setDragstate({
      dragging: true,
      startPos: clientX,
      currentPos: clientX,
    });
    console.log('START: ', clientX);
    if (_container && _container.current) {
      console.log('ELEMENT OFFSET: ', _container.current.getBoundingClientRect().left);
    }
  };

  const onDragMove = (clientX: number) => {
    if (dragstate.dragging) {
      setDragstate((d) => ({ ...d, currentPos: clientX }));
    }
  };

  return (
    <GraphFooter>
      <HorizontalScrollbar graph={graph} updateTimeline={(value) => move(value)} />
      <GraphFooterMetrics
        ref={_container}
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseMove={(e) => onDragMove(e.clientX)}
        onMouseOut={() => setDragstate({ ...dragstate, dragging: false })}
        onMouseUp={() => setDragstate({ ...dragstate, dragging: false })}
      >
        <div data-testid="timeline-footer-start">{((graph.timelineStart - graph.min) / 1000).toFixed(2)}s</div>
        <div data-testid="timeline-footer-end">{((graph.timelineEnd - graph.min) / 1000).toFixed(2)}s</div>
        {dragstate.dragging && (
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              top: 0,
              left: 0,
              transform: `translateX(${
                dragstate.startPos
                  ? getLeftValue(dragstate.startPos, dragstate.currentPos) -
                    (_container?.current?.getBoundingClientRect().left || 0)
                  : 0
              }px)`,
              width: getWidthValue(dragstate.startPos, dragstate.currentPos) + 'px',
              height: '20px',
              background: 'rgba(100,100,255,0.5)',
            }}
          ></div>
        )}
      </GraphFooterMetrics>
    </GraphFooter>
  );
};

const GraphFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 225px;
`;

const GraphFooterMetrics = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 1rem;
  font-size: 14px;
  position: relative;
`;

export default TimelineFooter;
