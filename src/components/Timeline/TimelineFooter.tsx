import React, { createRef, useEffect, useState } from 'react';
import { GraphState } from './useGraph';
import styled from 'styled-components';

import { formatDuration } from '../../utils/format';
import { StepLineData } from './useRowData';
import { Row } from './VirtualizedTimeline';

type TimelineFooterProps = {
  steps: StepLineData[];
  graph: GraphState;
  rows: Row[];
  move: (change: number) => void;
  updateHandle: (which: 'left' | 'right', to: number) => void;
};

const TimelineFooter: React.FC<TimelineFooterProps> = ({ graph, move, updateHandle, rows, steps }) => {
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

  //
  // Data processing
  //
  const [taskBasedLines, setTaskBasedLines] = useState<{ start: number; end: number; steps: string[] }[]>([]);
  useEffect(() => {
    if (graph.group) {
      return;
    } else {
      const perGroup = Math.ceil(rows.length / 13);
      const grps = [];
      for (let i = 0; i < 13; i++) {
        grps.push(rows.slice(perGroup * i, perGroup * i + perGroup));
      }

      const linegroups = grps.map((grp) => {
        const start = grp.sort((a, b) => takeSmallest(a) - takeSmallest(b))[0];
        const end = grp.sort((a, b) => takeBiggest(b) - takeBiggest(a))[0];

        return {
          start: start ? takeSmallest(start) : 0,
          end: end ? takeBiggest(end) : 0,
          steps: grp.map((r) => (r.type === 'task' ? r.data[0].step_name : r.data.step_name)),
        };
      });

      setTaskBasedLines(linegroups);
    }
  }, [rows, graph.group]);

  return (
    <TimelineFooterContainer>
      <TimelineFooterLeft></TimelineFooterLeft>
      <TimelineFooterContent>
        <MiniTimelineActive graph={graph} startMove={startMove} startHandleMove={startHandleDrag}></MiniTimelineActive>
        <MiniTimelineContainer ref={_container}>
          {graph.group
            ? steps.map((step) => (
                <MiniTimelineRow
                  key={step.original?.step_name || step.started_at}
                  graph={graph}
                  started={step.started_at}
                  finished={step.finished_at}
                  isFailed={step.isFailed}
                />
              ))
            : taskBasedLines.map((step, index) => (
                <MiniTimelineRow key={index} graph={graph} started={step.start} finished={step.end} isFailed={false} />
              ))}
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

const takeSmallest = (a: Row) => (a.type === 'task' ? a.data[0].started_at || a.data[0].ts_epoch : a.data.ts_epoch);
const takeBiggest = (a: Row) => (a.type === 'task' ? a.data[a.data.length - 1].finished_at : a.data.finished_at) || 0;

const MiniTimelineRow: React.FC<{
  started: number;
  finished: number;
  isFailed: boolean;
  graph: GraphState;
}> = ({ started, finished, isFailed, graph }) => {
  const width = ((finished - started) / (graph.max - graph.min)) * 100;
  const left = graph.sortBy === 'duration' ? 0 : ((started - graph.min) / (graph.max - graph.min)) * 100;

  return (
    <MiniTimelineLine
      isFailed={isFailed}
      style={{
        width: width + '%',
        left: left + '%',
      }}
    ></MiniTimelineLine>
  );
};

const MiniTimelineLine = styled.div<{ isFailed: boolean }>`
  position: relative;
  transition: all 0.15s;
  background: ${(p) => (p.isFailed ? p.theme.color.bg.red : p.theme.color.bg.green)};
  height: 2px;
  min-height: 2px;
  margin-bottom: 1px;
  min-width: 2px;
`;

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
  padding-right: 0.5rem;
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
