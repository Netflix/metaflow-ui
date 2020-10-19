import React, { createRef, useState } from 'react';
import { GraphState } from './useGraph';
import styled from 'styled-components';

import { RowDataModel } from './useRowData';
import { Step } from '../../types';
import { formatDuration } from '../../utils/format';
import Button from '../Button';
import Icon from '../Icon';

type TimelineFooterProps = {
  rowData: RowDataModel;
  graph: GraphState;
  hasStepFilter: boolean;
  resetSteps: () => void;
  move: (change: number) => void;
  updateHandle: (which: 'left' | 'right', to: number) => void;
};

const TimelineFooter: React.FC<TimelineFooterProps> = ({
  rowData,
  graph,
  hasStepFilter,
  resetSteps,
  move,
  updateHandle,
}) => {
  const _container = createRef<HTMLDivElement>();
  const [drag, setDrag] = useState({ dragging: false, start: 0 });
  const [handleDrag, setHandleDrag] = useState<{ dragging: boolean; which: 'left' | 'right' }>({
    dragging: false,
    which: 'left',
  });

  const handleMove = (clientX: number) => {
    if (!_container || !_container.current) {
      return;
    }

    if (handleDrag.dragging) {
      const rect = _container.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;

      updateHandle(handleDrag.which, graph.min + (graph.max - graph.min) * position);
    } else if (drag.dragging) {
      const movement = (clientX - drag.start) / _container.current.clientWidth;
      setDrag({ ...drag, start: clientX });
      move((graph.max - graph.min) * movement);
    }
  };

  const startMove = (clientX: number) => {
    setDrag({ ...drag, dragging: true, start: clientX });
  };

  const stopMove = () => {
    setDrag({ dragging: false, start: 0 });
  };

  const startHandleDrag = (which: 'left' | 'right') => {
    setHandleDrag({ dragging: true, which });
    setDrag({ ...drag, dragging: false });
  };

  const stopHandleDrag = () => {
    if (handleDrag.dragging) {
      setHandleDrag({ ...handleDrag, dragging: false });
    }
  };

  return (
    <TimelineFooterContainer>
      <TimelineFooterLeft>
        {hasStepFilter && (
          <Button withIcon="left" onClick={() => resetSteps()}>
            <Icon name="timeline" size="md" padRight />
            <span>Show all steps</span>
          </Button>
        )}
      </TimelineFooterLeft>
      <TimelineFooterContent>
        <MiniTimelineActive graph={graph} startMove={startMove} startHandleMove={startHandleDrag}></MiniTimelineActive>
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

      {(drag.dragging || handleDrag.dragging) && (
        <div
          style={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            zIndex: 10,
          }}
          onMouseMove={(e) => handleMove(e.clientX)}
          onTouchMove={(e) => move(e.touches[0].clientX)}
          onMouseLeave={() => {
            stopHandleDrag();
            stopMove();
          }}
          onMouseUp={() => {
            stopHandleDrag();
            stopMove();
          }}
        ></div>
      )}
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
        background: '#20AF2E',
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
  startHandleMove: (which: 'left' | 'right') => void;
}> = ({ graph, startMove, startHandleMove }) => {
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
    >
      <MiniTimelineZoomHandle
        which="left"
        label={graph.timelineStart <= graph.min ? '0.0s' : formatDuration(graph.timelineStart - graph.min)}
        onDragStart={() => startHandleMove('left')}
      />
      <MiniTimelineZoomHandle
        which="right"
        label={formatDuration(graph.timelineEnd - graph.min)}
        onDragStart={() => startHandleMove('right')}
      />
    </MiniTimelineActiveSection>
  );
};

const MiniTimelineZoomHandle: React.FC<{ which: 'left' | 'right'; label: string; onDragStart: () => void }> = ({
  label,
  onDragStart,
  which,
}) => (
  <MiniTimelineHandle
    style={which === 'right' ? { right: '-5px' } : { left: '-5px' }}
    onMouseDown={() => onDragStart()}
  >
    <div />
    <div />
    <div />
    <MiniTimelineLabel>{label}</MiniTimelineLabel>
  </MiniTimelineHandle>
);

const TimelineFooterContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 40px;
  margin-bottom: 25px;
`;

const TimelineFooterLeft = styled.div`
  display: inline-block;
  width: 245px;
  margin: 0.5rem 0;
  padding: 0 0.5rem;

  button {
    justify-content: center;
    width: 100%;
  }
`;

const TimelineFooterContent = styled.div`
  position: relative;
  flex: 1;
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.thinLight};
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
  border-left: ${(p) => p.theme.border.thinLight};
  border-right: ${(p) => p.theme.border.thinLight};
  border-bottom: 8px solid ${(p) => p.theme.color.border.light};
  cursor: grab;
`;

const MiniTimelineHandle = styled.div`
  position: absolute;
  top: 7px;
  height: 29px;
  width: 10px;
  background: ${(p) => p.theme.color.bg.blue};
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > div {
    height: 1px;
    width: 4px;
    background: ${(p) => p.theme.color.bg.white};
    margin-bottom: 2px;
  }
`;

const MiniTimelineLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: -50%;
  font-size: 14px;
`;

export default TimelineFooter;
