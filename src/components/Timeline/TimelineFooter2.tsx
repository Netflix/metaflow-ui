import React, { createRef, useState } from 'react';
import { GraphState } from './useGraph';
import styled from 'styled-components';

import { RowDataModel } from './useRowData';
import { Step } from '../../types';

type TimelineFooterProps = {
  rowData: RowDataModel;
  graph: GraphState;
  move: (change: number) => void;
};

const TimelineFooter2: React.FC<TimelineFooterProps> = ({ rowData, graph, move }) => {
  const _container = createRef<HTMLDivElement>();
  const [drag, setDrag] = useState({ dragging: false, start: 0 });
  const [handleDrag, setHandleDrag] = useState<{ dragging: boolean; which: 'left' | 'right' }>({
    dragging: false,
    which: 'left',
  });

  const handleMove = (clientX: number) => {
    if (drag.dragging) {
      if (_container && _container.current) {
        const movement = (clientX - drag.start) / _container.current?.clientWidth;
        setDrag({ ...drag, start: clientX });
        move((graph.max - graph.min) * movement);
      }
    }
  };

  const startMove = (clientX: number) => {
    setDrag({ ...drag, dragging: true, start: clientX });
  };

  const stopMove = () => {
    setDrag({ dragging: false, start: 0 });
  };

  const startHandleDrag = () => {};

  return (
    <TimelineFooterContainer>
      <TimelineFooterContent>
        <MiniTimelineActive
          graph={graph}
          handleMove={handleMove}
          startMove={startMove}
          stopMove={stopMove}
        ></MiniTimelineActive>
        <MiniTimelineContainer ref={_container}>
          {Object.keys(rowData).map((key) => {
            const step = rowData[key].step;
            if (step) {
              return (
                <MiniTimelineRow
                  key={step.step_name}
                  graph={graph}
                  step={{ ...step, finished_at: step.finished_at || rowData[key].finished_at || step.ts_epoch }}
                />
              );
            }
            return null;
          })}
        </MiniTimelineContainer>
      </TimelineFooterContent>
    </TimelineFooterContainer>
  );
};

const MiniTimelineRow: React.FC<{
  step: Step;
  graph: GraphState;
}> = ({ step, graph }) => {
  const width = (((step.finished_at || 0) - step.ts_epoch) / (graph.max - graph.min)) * 100;
  const left = ((step.ts_epoch - graph.min) / (graph.max - graph.min)) * 100;

  return (
    <div
      style={{
        position: 'relative',
        background: 'green',
        height: '2px',
        width: width + '%',
        left: left + '%',
        marginBottom: '1px',
        minWidth: '2px',
      }}
    ></div>
  );
};

const MiniTimelineActive: React.FC<{
  graph: GraphState;
  startMove: (value: number) => void;
  handleMove: (value: number) => void;
  stopMove: () => void;
}> = ({ graph, startMove, handleMove, stopMove }) => {
  const width = ((graph.timelineEnd - graph.timelineStart) / (graph.max - graph.min)) * 100;
  const left = ((graph.timelineStart - graph.min) / (graph.max - graph.min)) * 100;

  return (
    <MiniTimelineActiveSection
      style={{
        width: width + '%',
        left: left + '%',
      }}
      onMouseDown={(e) => startMove(e.clientX)}
      onTouchStart={(e) => startMove(e.touches[0].clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onMouseUp={stopMove}
      onMouseLeave={stopMove}
      onTouchEnd={stopMove}
      onTouchCancel={stopMove}
    >
      <MiniTimelineHandle style={{ left: '-5px' }}>
        <div />
        <div />
        <div />
      </MiniTimelineHandle>
      <MiniTimelineHandle style={{ right: '-5px' }}>
        <div />
        <div />
        <div />
      </MiniTimelineHandle>
    </MiniTimelineActiveSection>
  );
};

const TimelineFooterContainer = styled.div`
  position: relative;
  width: 100%;
  height: 40px;
  padding-left: 225px;
`;

const TimelineFooterContent = styled.div`
  position: relative;
  background: #f6f6f6;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 49px;
`;

const MiniTimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: 41px;

  pointer-events: none;
`;

const MiniTimelineActiveSection = styled.div`
  position: relative;
  height: 49px;
  background #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 8px solid rgba(0, 0, 0, 0.1);
  cursor: grab;
`;

const MiniTimelineHandle = styled.div`
  position: absolute;
  top: 7px;
  height: 29px;
  width: 10px;
  background: #2f80ed;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > div {
    height: 1px;
    width: 4px;
    background: #fff;
    margin-bottom: 2px;
  }
`;

export default TimelineFooter2;
