import React, { createRef, useEffect, useState } from 'react';
import { GraphState } from '../useGraph';
import styled from 'styled-components';
import { Row, StepRow } from '../VirtualizedTimeline';
import { getLongestRowDuration, getTaskLineStatus, startAndEndpointsOfRows } from '../../../utils/row';
import { TaskStatus } from '../../../types';
import FEATURE_FLAGS from '../../../FEATURE';
import MinimapRow from './MinimapRow';
import MinimapActiveSection from './MinimapActiveSection';

//
// Typedef
//

type TimelineFooterProps = {
  graph: GraphState;
  rows: Row[];
  move: (change: number) => void;
  updateHandle: (which: 'left' | 'right', to: number) => void;
  updateDragging: (dragging: boolean) => void;
};

type LineData = { start: number; end: number; status: TaskStatus };

//
// Component
//

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
        <MinimapActiveSection
          graph={graph}
          dragging={drag.dragging || handleDrag.dragging}
          startMove={startMove}
          startHandleMove={startHandleDrag}
        ></MinimapActiveSection>
        <MinimapContainer ref={_container}>
          {FEATURE_FLAGS.TIMELINE_MINIMAP &&
            lines.map((step, index) => (
              <MinimapRow
                key={index + step.start}
                graph={graph}
                started={step.start}
                finished={step.end}
                status={step.status}
              />
            ))}
        </MinimapContainer>
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

//
// Style
//

const TimelineFooterContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 2.5rem;
  margin-bottom: 1.5625rem;
  border-top: ${(p) => p.theme.border.mediumLight};
`;

const TimelineFooterLeft = styled.div`
  display: inline-block;
  width: 15.3125rem;
  margin: 0.5rem 0;
  padding-right: 0.5rem;
`;

const TimelineFooterContent = styled.div`
  position: relative;
  flex: 1;
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.thinLight};
  height: 3.0625rem;
`;

const MinimapContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: 2.5625rem;

  pointer-events: none;
`;

export default TimelineFooter;
