import React from 'react';
import styled, { DefaultTheme, keyframes, css } from 'styled-components';
import { Step, Task } from '../../../types';
import { StepRowData } from '../useTaskData';
import { GraphState } from '../useGraph';
import { lineColor, getRowStatus, getLengthLabelPosition } from './utils';
import { formatDuration } from '../../../utils/format';
import { lighten } from 'polished';

//
// Typedef
//

type LineElementProps = {
  row: { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task };
  graph: GraphState;
  grayed?: boolean;
  isLastAttempt: boolean;
  duration: number | null;
  startTimeOfFirstAttempt?: number;
  dragging: boolean;
};

export type LabelPosition = 'left' | 'right' | 'none';

//
// Component
//

const LineElement: React.FC<LineElementProps> = ({
  row,
  graph,
  grayed,
  isLastAttempt,
  duration,
  startTimeOfFirstAttempt,
  dragging,
}) => {
  const status = getRowStatus(row);
  // Extend visible area little bit to prevent lines seem like going out of bounds. Happens
  // in some cases with short end task
  const extendAmount = (graph.timelineEnd - graph.timelineStart) * 0.01;
  const visibleDuration = graph.timelineEnd - graph.timelineStart + extendAmount;
  const boxStartTime = row.type === 'step' ? row.data.ts_epoch : row.data.started_at;

  if (!boxStartTime) {
    return null;
  }

  // Calculate have much box needs to be pushed from (or to) left
  const valueFromLeft =
    graph.alignment === 'fromLeft'
      ? ((graph.min - graph.timelineStart + (startTimeOfFirstAttempt ? boxStartTime - startTimeOfFirstAttempt : 0)) /
          visibleDuration) *
        100
      : ((boxStartTime - graph.timelineStart) / visibleDuration) * 100;

  const width = duration && status !== 'running' ? (duration / visibleDuration) * 100 : 100 - valueFromLeft;

  const labelPosition = getLengthLabelPosition(valueFromLeft, width);

  return (
    <LineElementContainer
      style={{ transform: `translateX(${valueFromLeft}%)` }}
      dragging={dragging}
      data-testid="boxgraphic-container"
    >
      <BoxGraphic
        root={row.type === 'step'}
        style={{
          width: `${width}%`,
        }}
        data-testid="boxgraphic"
        dragging={dragging}
        title={formatDuration(duration)}
      >
        {(isLastAttempt || status === 'running') && (
          <RowMetricLabel duration={duration} labelPosition={labelPosition} data-testid="boxgraphic-label" />
        )}
        <BoxGraphicLine grayed={grayed} state={status} isLastAttempt={isLastAttempt} />
        <BoxGraphicMarkerStart />
        {status !== 'running' && <BoxGraphicMarkerEnd />}
      </BoxGraphic>
    </LineElementContainer>
  );
};

// Container for duration value
const RowMetricLabel: React.FC<{
  duration: null | number;
  labelPosition: LabelPosition;
  'data-testid'?: string;
}> = ({ duration, labelPosition, ...rest }) =>
  labelPosition === 'none' ? null : (
    <BoxGraphicValue position={labelPosition} {...rest}>
      {duration ? formatDuration(duration, 1) : '?'}
    </BoxGraphicValue>
  );

//
// Style
//

const LineElementContainer = styled.div<{ dragging: boolean }>`
  width: 100%;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s transform')};
`;

export const BoxGraphicValue = styled.div<{ position: LabelPosition }>`
  position: absolute;
  left: ${({ position }) => (position === 'right' ? '100%' : 'auto')};
  right: ${({ position }) => (position === 'left' ? '100%' : 'auto')};
  padding: 0 10px;
  top: 1px;
  line-height: 26px;
  font-size: 12px;
  white-space: nowrap;

  &::after {
    content: '';
    transition: background 0.15s;
    position: absolute;
    width: 100%;
    height: 6px;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: -1;
    background: rgba(255, 255, 255, 0.8);
  }
`;

const BoxGraphic = styled.div<{ root: boolean; dragging: boolean }>`
  position: absolute;
  cursor: pointer;
  color: ${(p) => p.theme.color.text.dark};
  min-width: 5px;
  height: 27px;
  line-height: 27px;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s width')};
`;

const UnkownAnimation = (theme: DefaultTheme) => keyframes`
  0%, 100% { background: ${lighten(0.4, theme.color.bg.dark)} }
  50% { background: ${theme.color.bg.dark} }
`;

const UnkownMoveAnimation = keyframes`
  0%, 100% { transform: translateX(-100%) }
  50% { transform: translateX(100%) }
`;

const BoxGraphicLine = styled.div<{ grayed?: boolean; state: string; isLastAttempt: boolean }>`
  position: absolute;
  background: ${(p) => lineColor(p.theme, p.grayed || false, p.state, p.isLastAttempt)};
  width: 100%;
  height: 6px;
  top: 50%;
  transform: translateY(-50%);
  transition: background 0.15s;
  overflow: hidden;

  ${(p) =>
    p.state === 'unknown' &&
    css`
      animation: 5s ${UnkownAnimation(p.theme)} infinite;
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 200%;
        background: rgb(255, 255, 255, 0.8);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.5) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        top: -50%;
        left: 0;
        animation: 5s ${UnkownMoveAnimation} infinite ease-in-out;
      }
    `}

  &:hover {
    background: ${(p) => lineColor(p.theme, p.grayed || false, p.state, p.isLastAttempt)};
  }
`;

const BoxGraphicMarker = css`
  height: 3px;
  width: 1px;
  background: ${(p) => p.theme.color.bg.dark};
  position: absolute;
  bottom: 0;
`;

const BoxGraphicMarkerStart = styled.div`
  ${BoxGraphicMarker};
  left: 0;
`;

const BoxGraphicMarkerEnd = styled.div`
  ${BoxGraphicMarker};
  right: 0;
`;

export default LineElement;
