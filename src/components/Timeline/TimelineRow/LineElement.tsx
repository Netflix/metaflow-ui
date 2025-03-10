import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import styled, { css, keyframes } from 'styled-components';
import { Step, Task } from '@/types';
import { getTimestampString } from '@utils/date';
import { formatDuration } from '@utils/format';
import { getPathFor } from '@utils/routing';
import { brightenCssVar } from '@utils/style';
import { TimezoneContext } from '../../TimezoneProvider';
import { StepRowData } from '../useTaskData';
import { TasksSortBy } from '../useTaskListSettings';
import { getLengthLabelPosition, getRowStatus, lineColor } from './utils';

//
// Typedef
//

type LineElementProps = {
  row: { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task };
  timeline: {
    startTime: number;
    visibleEndTime: number;
    visibleStartTime: number;
    sortBy: TasksSortBy;
  };
  grayed?: boolean;
  isLastAttempt: boolean;
  duration: number | null;
  startTimeOfFirstAttempt?: number;
  dragging: boolean;
  paramsString?: string;
};

export type LabelPosition = 'left' | 'right' | 'none';

//
// Component
//

const LineElement: React.FC<LineElementProps> = ({
  row,
  timeline,
  grayed,
  isLastAttempt,
  duration,
  startTimeOfFirstAttempt,
  dragging,
  paramsString,
}) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);

  const { push } = useHistory();
  const status = getRowStatus(row);
  // Extend visible area little bit to prevent lines seem like going out of bounds. Happens
  // in some cases with short end task
  const extendAmount = (timeline.visibleEndTime - timeline.visibleStartTime) * 0.01;
  const visibleDuration = timeline.visibleEndTime - timeline.visibleStartTime + extendAmount;
  const boxStartTime = row.type === 'step' ? row.data.ts_epoch : row.data.started_at;

  if (!boxStartTime || status === 'pending') {
    return null;
  }

  // Calculate have much box needs to be pushed from (or to) left
  const valueFromLeft =
    timeline.sortBy === 'duration'
      ? ((timeline.startTime -
          timeline.visibleStartTime +
          (startTimeOfFirstAttempt ? boxStartTime - startTimeOfFirstAttempt : 0)) /
          visibleDuration) *
        100
      : ((boxStartTime - timeline.visibleStartTime) / visibleDuration) * 100;

  const width = duration && status !== 'running' ? (duration / visibleDuration) * 100 : 100 - valueFromLeft;

  const labelPosition = getLengthLabelPosition(valueFromLeft, width);

  const title =
    formatDuration(duration) +
    `${status === 'unknown' ? ` (${t('task.unable-to-find-status')})` : ''} ${getTimestampString(
      new Date(boxStartTime),
      timezone,
    )}-${duration ? getTimestampString(new Date(boxStartTime + duration), timezone) : ''}`;

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
        title={title}
        onClick={(e) => {
          if (row.type === 'task') {
            e.stopPropagation();
            e.preventDefault();
            push(`${getPathFor.attempt(row.data)}&${paramsString}`);
          }
        }}
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
      {duration ? formatDuration(duration, 1) : ''}
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
  padding: 0 0.625rem;
  top: 1px;
  line-height: 1.625rem;
  font-size: 0.75rem;
  white-space: nowrap;

  &::after {
    content: '';
    transition: background 0.15s;
    position: absolute;
    width: 100%;
    height: 0.375rem;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: -1;
  }
`;

const BoxGraphic = styled.div<{ root: boolean; dragging: boolean }>`
  position: absolute;
  cursor: pointer;
  color: var(--color-text-primary);
  min-width: 0.3125rem;
  height: 1.6875rem;
  line-height: 1.6875rem;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s width')};
`;

const UnkownAnimation = () => keyframes`
  0%, 100% { background: ${brightenCssVar('--color-bg-disabled', 40)} }
  50% { background: var(--color-bg-disabled) }
`;

const UnkownMoveAnimation = keyframes`
  0%, 100% { transform: translateX(-100%) }
  50% { transform: translateX(100%) }
`;

const BoxGraphicLine = styled.div<{ grayed?: boolean; state: string; isLastAttempt: boolean }>`
  position: absolute;
  background: ${(p) => lineColor(p.grayed || false, p.state, p.isLastAttempt)};
  border-radius: var(--timeline-line-border-radius);
  width: 100%;
  height: 0.375rem;
  top: 50%;
  transform: translateY(-50%);
  transition: background 0.15s;
  overflow: hidden;

  ${(p) =>
    p.state === 'refining' &&
    css`
      animation: 5s ${UnkownAnimation()} infinite;
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
    background: ${(p) => lineColor(p.grayed || false, p.state, p.isLastAttempt)};
  }
`;

const BoxGraphicMarker = css`
  height: 0.1875rem;
  width: 1px;
  background: var(--color-bg-disabled);
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
