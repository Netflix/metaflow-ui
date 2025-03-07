import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Row, StepRow } from '../VirtualizedTimeline';
import { getLongestRowDuration, getTaskLineStatus, startAndEndpointsOfRows } from '@utils/row';
import { TaskStatus } from '@/types';
import FEATURE_FLAGS from '@utils/FEATURE';
import MinimapRow from './MinimapRow';
import MinimapActiveSection from './MinimapActiveSection';
import { TimelineMetrics } from '../Timeline';

//
// Typedef
//

export type MinimapFooterProps = {
  timeline: TimelineMetrics;
  rows: Row[];
  onMove: (change: number) => void;
  onHandleMove: (which: 'left' | 'right', to: number) => void;
  onDraggingStateChange: (dragging: boolean) => void;
};

type LineData = { start: number; end: number; status: TaskStatus };

//
// Component
//

const MinimapFooter: React.FC<MinimapFooterProps> = ({
  timeline,
  onMove,
  onHandleMove,
  rows,
  onDraggingStateChange,
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

      onHandleMove(handleDrag.which, timeline.startTime + (timeline.endTime - timeline.startTime) * position);
    } else if (drag.dragging) {
      const movement = (clientX - drag.start) / _container.current.clientWidth;
      setDrag({ ...drag, start: clientX });
      onMove((timeline.endTime - timeline.startTime) * movement);
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
    if (timeline.groupingEnabled) {
      const steps: LineData[] = rows
        .filter((row) => row.type === 'step')
        .map((steprow) => {
          const srow = steprow as StepRow;
          return {
            start: srow.data.ts_epoch,
            end: srow.rowObject.status === 'running' ? timeline.endTime : srow.rowObject.finished_at,
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

        if (timeline.sortBy !== 'duration') {
          const { start, end } = startAndEndpointsOfRows(grp);
          return { status, start, end: status === 'running' ? timeline.endTime : end };
        } else {
          const timings = startAndEndpointsOfRows(grp);
          const longest = getLongestRowDuration(grp);

          return {
            start: status === 'running' ? timeline.startTime : timings.start,
            end: status === 'running' ? timeline.endTime : timings.start + longest,
            status,
          };
        }
      });

      setLines(linegroups.filter((r) => r.start !== 0 && r.end !== 0));
    }
  }, [rows, timeline.groupingEnabled, timeline.sortBy, timeline.startTime, timeline.endTime]);

  useEffect(() => {
    onDraggingStateChange(drag.dragging || handleDrag.dragging);
  }, [drag.dragging, handleDrag.dragging, onDraggingStateChange]);

  return (
    <>
      <MinimapFooterContent>
        <MinimapActiveSection
          timeline={timeline}
          dragging={drag.dragging || handleDrag.dragging}
          startMove={startMove}
          startHandleMove={startHandleDrag}
        ></MinimapActiveSection>
        <MinimapContainer ref={_container}>
          {FEATURE_FLAGS.TIMELINE_MINIMAP &&
            lines.map((step, index) => (
              <MinimapRow
                key={index + step.start + step.end}
                timeline={timeline}
                started={step.start}
                finished={step.end}
                status={step.status}
              />
            ))}
        </MinimapContainer>
      </MinimapFooterContent>

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
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
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
    </>
  );
};

//
// Style
//

const MinimapFooterContent = styled.div`
  position: relative;
  flex: 1;
  background: var(--timeline-footer-bg);
  border-bottom: var(--border-thin-1);
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

export default MinimapFooter;
