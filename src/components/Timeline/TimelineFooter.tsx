import React, { createRef, useEffect, useState } from 'react';
import { GraphState } from './useGraph';
import styled, { css } from 'styled-components';

import { formatDuration } from '../../utils/format';
import { Row, StepRow } from './VirtualizedTimeline';
import { getLongestRowDuration, getTaskLineStatus, startAndEndpointsOfRows } from '../../utils/row';
import { lineColor } from './TimelineRow';
import { TaskStatus } from '../../types';
import FEATURE_FLAGS from '../../FEATURE';

type TimelineFooterProps = {
  graph: GraphState;
  rows: Row[];
  move: (change: number) => void;
  updateHandle: (which: 'left' | 'right', to: number) => void;
  updateDragging: (dragging: boolean) => void;
};

type LineData = { start: number; end: number; status: TaskStatus };

const TimelineFooter: React.FC<TimelineFooterProps> = ({ graph, move, updateHandle, rows, updateDragging }) => {
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
  const [lines, setLines] = useState<LineData[]>([]);
  useEffect(() => {
    if (graph.group) {
      const steps: LineData[] = rows
        .filter((row) => row.type === 'step')
        .map((steprow) => {
          const srow = steprow as StepRow;
          return {
            start: srow.data.ts_epoch,
            end: srow.rowObject.status === 'running' ? graph.max : srow.rowObject.finished_at,
            status: srow.rowObject.status,
          };
        });

      setLines(steps);
    } else {
      // If we are not grouping, we make lines from task rows.
      // 13 groups since we cannot fit more.
      const perGroup = Math.ceil(rows.length / 13);
      const grps = [];
      // Cut all rows to 13 groups
      for (let i = 0; i < 13; i++) {
        grps.push(rows.slice(perGroup * i, perGroup * i + perGroup));
      }
      // Calculate start and end points for each group
      const linegroups = grps.map((grp) => {
        const status = getTaskLineStatus(grp);

        if (graph.sortBy !== 'duration') {
          const { start, end } = startAndEndpointsOfRows(grp);
          return { status, start, end: status === 'running' ? graph.max : end };
        } else {
          const timings = startAndEndpointsOfRows(grp);
          const longest = getLongestRowDuration(grp);

          return {
            start: status === 'running' ? graph.min : timings.start,
            end: status === 'running' ? graph.max : timings.start + longest,
            status,
          };
        }
      });

      setLines(linegroups.filter((r) => r.start !== 0 && r.end !== 0));
    }
  }, [rows, graph.group, graph.sortBy, graph.min, graph.max]);

  useEffect(() => {
    updateDragging(drag.dragging || handleDrag.dragging);
  }, [drag.dragging, handleDrag.dragging, updateDragging]);

  return (
    <TimelineFooterContainer>
      <TimelineFooterLeft></TimelineFooterLeft>
      <TimelineFooterContent>
        <MiniTimelineActive
          graph={graph}
          dragging={drag.dragging || handleDrag.dragging}
          startMove={startMove}
          startHandleMove={startHandleDrag}
        ></MiniTimelineActive>
        <MiniTimelineContainer ref={_container}>
          {FEATURE_FLAGS.TIMELINE_MINIMAP &&
            lines.map((step, index) => (
              <MiniTimelineRow
                key={index}
                graph={graph}
                started={step.start}
                finished={step.end}
                status={step.status}
              />
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

const MiniTimelineRow: React.FC<{
  started: number;
  finished: number;
  status: TaskStatus;
  graph: GraphState;
}> = ({ started, finished, status, graph }) => {
  const width = ((finished - started) / (graph.max - graph.min)) * 100;
  const left = graph.sortBy === 'duration' ? 0 : ((started - graph.min) / (graph.max - graph.min)) * 100;

  return (
    <MiniTimelineLine
      status={status}
      style={{
        width: width + '%',
        left: left + '%',
      }}
    ></MiniTimelineLine>
  );
};

const MiniTimelineLine = styled.div<{ status: TaskStatus }>`
  position: relative;
  background: ${(p) => lineColor(p.theme, false, p.status, true, false)};
  height: 2px;
  min-height: 2px;
  margin-bottom: 1px;
  min-width: 2px;
`;

const MiniTimelineActive: React.FC<{
  graph: GraphState;
  dragging: boolean;
  startMove: (value: number) => void;
  startHandleMove: (which: 'left' | 'right') => void;
}> = ({ graph, dragging, startMove, startHandleMove }) => {
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
      <MiniTimelineZoomHandle
        which="left"
        isZoomed={width < 20}
        label={graph.timelineStart <= graph.min ? '0.0s' : formatDuration(graph.timelineStart - graph.min)}
        onDragStart={() => startHandleMove('left')}
      />
      <MiniTimelineZoomHandle
        which="right"
        isZoomed={width < 20}
        stackText={width + left > 90}
        label={formatDuration(graph.timelineEnd - graph.min)}
        onDragStart={() => startHandleMove('right')}
      />
    </MiniTimelineActiveSection>
  );
};

type HandleProps = {
  which: 'left' | 'right';
  label: string;
  onDragStart: () => void;
  isZoomed: boolean;
  stackText?: boolean;
};

const MiniTimelineZoomHandle: React.FC<HandleProps> = ({ label, onDragStart, which, isZoomed, stackText }) => (
  <MiniTimelineHandle
    style={which === 'right' ? { right: '-5px' } : { left: '-5px' }}
    onMouseDown={() => onDragStart()}
  >
    <MiniTimelineIconLine />
    <MiniTimelineIconLine />
    <MiniTimelineIconLine />
    <MiniTimelineLabel which={which} isZoomed={isZoomed} stackText={stackText}>
      {label}
    </MiniTimelineLabel>
  </MiniTimelineHandle>
);

//
// Style
//

const TimelineFooterContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 40px;
  margin-bottom: 25px;
  border-top: ${(p) => p.theme.border.mediumLight};
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
`;

const MiniTimelineIconLine = styled.div`
  height: 1px;
  width: 4px;
  background: ${(p) => p.theme.color.bg.white};
  margin-bottom: 2px;
`;

const LeftLabelPositioning = css<{ isZoomed: boolean }>`
  ${(p) => (p.isZoomed ? 'right: 100%;' : 'left: 0%')}
`;

const RightLabelPositioning = css<{ isZoomed: boolean }>`
  ${(p) => (p.isZoomed ? 'left: 0%' : 'right: 100%;')}
`;

const MiniTimelineLabel = styled.div<{ which: 'left' | 'right'; isZoomed: boolean; stackText?: boolean }>`
  position: absolute;
  top: 50px;

  right: ${(p) => (p.which === 'right' ? '100%' : 'none')};
  font-size: 14px;
  white-space: ${(p) => (p.stackText && p.isZoomed ? 'none' : 'pre')};

  ${(p) => (p.which === 'left' ? LeftLabelPositioning : RightLabelPositioning)}
`;

export default TimelineFooter;
