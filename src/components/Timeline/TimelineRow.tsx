import React, { useMemo } from 'react';
import styled, { css, DefaultTheme, keyframes } from 'styled-components';
import { Row } from './VirtualizedTimeline';
import { GraphState } from './useGraph';
import { Link } from 'react-router-dom';
import { getPathFor } from '../../utils/routing';
import { Step, Task, TaskStatus } from '../../types';
import { formatDuration } from '../../utils/format';
import { lighten } from 'polished';
import { TFunction } from 'i18next';
import TaskListLabel from './TaskListLabel';
import { StepRowData } from './useRowData';

type TimelineRowProps = {
  // Row type and data
  item?: Row;
  // Overall graph state (used to calculate dimensions)
  graph: GraphState;
  onOpen: () => void;
  isGrouped: boolean;
  isOpen?: boolean;
  // Flag row as sticky for some absolute stylings
  sticky?: boolean;
  paramsString?: string;
  t: TFunction;
  dragging: boolean;
};

type LabelPosition = 'left' | 'right' | 'none';

const TimelineRow: React.FC<TimelineRowProps> = ({
  item,
  graph,
  onOpen,
  isOpen = true,
  isGrouped,
  paramsString,
  sticky,
  t,
  dragging,
}) => {
  if (!item || !item.data) return null;
  const Element = sticky ? StickyStyledRow : StyledRow;

  return (
    <>
      <Element>
        {item.type === 'step' ? (
          <TaskListLabel
            type="step"
            item={item.data}
            toggle={onOpen}
            open={isOpen}
            grouped={isGrouped}
            t={t}
            duration={getStepDuration(item, graph)}
            status={getRowStatus(item)}
          />
        ) : (
          <TaskListLabel
            type="task"
            item={item.data[item.data.length - 1]}
            open={isOpen}
            duration={item.data[item.data.length - 1].duration || null}
            grouped={isGrouped}
            paramsString={paramsString}
            status={getRowStatus({ type: 'task', data: item.data[item.data.length - 1] })}
            t={t}
          />
        )}
        <RowElement item={item} onOpen={onOpen}>
          {item.type === 'step' ? (
            <BoxGraphicElement
              graph={graph}
              row={item}
              grayed={isOpen}
              duration={item.rowObject.status === 'running' ? 0 : item.rowObject.duration}
              labelDuration={getStepDuration(item, graph)}
              isLastAttempt
              dragging={dragging}
            />
          ) : (
            item.data.map((task, index) => (
              <BoxGraphicElement
                key={task.finished_at}
                graph={graph}
                row={{ type: 'task', data: task }}
                isLastAttempt={index === item.data.length - 1}
                duration={task.duration || 0}
                labelDuration={item.data[item.data.length - 1].duration}
                startTimeOfFirstAttempt={graph.sortBy === 'duration' ? item.data[0].started_at || 0 : undefined}
                dragging={dragging}
              />
            ))
          )}
        </RowElement>
      </Element>
    </>
  );
};

const RowElement: React.FC<{ item: Row; onOpen: () => void }> = ({ item, children, onOpen }) => {
  if (item.type === 'task') {
    return (
      <RowGraphLinkContainer to={getPathFor.task(item.data[0])} data-testid="timeline-row-graphic-container">
        {children}
      </RowGraphLinkContainer>
    );
  }
  return (
    <RowGraphContainer onClick={onOpen} data-testid="timeline-row-graphic-container">
      {children}
    </RowGraphContainer>
  );
};

type BoxGraphicElementProps = {
  row: { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task };
  graph: GraphState;
  grayed?: boolean;
  isLastAttempt: boolean;
  duration: number | null;
  labelDuration?: number | null;
  startTimeOfFirstAttempt?: number;
  dragging: boolean;
};

export const BoxGraphicElement: React.FC<BoxGraphicElementProps> = ({
  row,
  graph,
  grayed,
  isLastAttempt,
  duration,
  labelDuration,
  startTimeOfFirstAttempt,
  dragging,
}) => {
  const status = getRowStatus(row);
  const boxStartTime = row.type === 'step' ? row.data.ts_epoch : row.data.started_at || row.data.ts_epoch;

  const { left, width, labelPosition } = useMemo(
    () => calculateRowMetrics(graph, boxStartTime, duration, startTimeOfFirstAttempt, status),
    [graph, boxStartTime, duration, startTimeOfFirstAttempt, status],
  );
  return (
    <BoxGraphicContainer
      style={{ transform: `translateX(${left}%)` }}
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
      >
        {((isLastAttempt && labelDuration) || status === 'running') && (
          <RowMetricLabel
            duration={labelDuration || Date.now() - boxStartTime}
            labelPosition={labelPosition}
            data-testid="boxgraphic-label"
          />
        )}
        <BoxGraphicLine grayed={grayed} state={status} isLastAttempt={isLastAttempt} />
        <BoxGraphicMarkerStart />
        {status !== 'running' && <BoxGraphicMarkerEnd />}
      </BoxGraphic>
    </BoxGraphicContainer>
  );
};

export function getRowStatus(
  row: { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task },
): TaskStatus {
  if (row.type === 'step') {
    return row.rowObject.status;
  } else {
    if (row.data.status) {
      return row.data.status;
    } else {
      return row.data.finished_at ? 'completed' : 'running';
    }
  }
}

function calculateRowMetrics(
  graph: GraphState,
  boxStartTime: number,
  duration: number | null,
  startTime: number | undefined,
  status: TaskStatus,
) {
  // Extend visible area little bit to prevent lines seem like going out of bounds. Happens
  // in some cases with short end task
  const extendAmount = (graph.timelineEnd - graph.timelineStart) * 0.01;
  const visibleDuration = graph.timelineEnd - graph.timelineStart + extendAmount;

  // Calculate have much box needs to be pushed from (or to) left
  const left =
    graph.alignment === 'fromLeft'
      ? ((graph.min - graph.timelineStart + (startTime ? boxStartTime - startTime : 0)) / visibleDuration) * 100
      : ((boxStartTime - graph.timelineStart) / visibleDuration) * 100;

  const width = duration && status !== 'running' ? (duration / visibleDuration) * 100 : 100 - left;

  const labelPosition = getLengthLabelPosition(left, width);

  return { width, left, labelPosition };
}

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

function getLengthLabelPosition(fromLeft: number, width: number): LabelPosition {
  if (fromLeft + width < 90) {
    return 'right';
  } else if (fromLeft + width > 90 && fromLeft > 10) {
    return 'left';
  }

  return 'none';
}

function getStepDuration(item: { type: 'step'; data: Step; rowObject: StepRowData }, graph: GraphState): number {
  return item.rowObject.status === 'running' ? graph.max - item.data.ts_epoch : item.rowObject.duration;
}

const BoxGraphicContainer = styled.div<{ dragging: boolean }>`
  width: 100%;
  transition: ${(p) => (p.dragging ? 'none' : '0.5s transform')};
`;

const BoxGraphicValue = styled.div<{ position: LabelPosition }>`
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

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  min-height: 28px;
  border-bottom: ${(p) => p.theme.border.thinLight};
  transition: background 0.15s;

  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};

    ${BoxGraphicValue} {
      &::after {
        background: ${(p) => p.theme.color.bg.blueLight};
      }
    }
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: ${(p) => p.theme.color.bg.white};
  top: 0;
  left: 0;
`;

const RowContainerStyles = css`
  position: relative;
  width: 100%;
  border-left: ${(p) => p.theme.border.thinLight};
  overflow-x: hidden;
`;

const RowGraphLinkContainer = styled(Link)`
  ${RowContainerStyles}
`;

const RowGraphContainer = styled.div`
  ${RowContainerStyles}
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

export function lineColor(
  theme: DefaultTheme,
  grayed: boolean,
  state: string,
  isFirst: boolean,
  isHovered?: boolean,
): string {
  if (grayed) {
    return '#c7c7c7';
  } else {
    switch (state) {
      case 'completed':
      case 'ok':
        return !isFirst ? lighten(isHovered ? 0.2 : 0.3, theme.color.bg.red) : theme.color.bg.green;
      case 'running':
        return theme.color.bg.yellow;
      case 'failed':
        return !isFirst ? lighten(isHovered ? 0.2 : 0.3, theme.color.bg.red) : theme.color.bg.red;
      case 'unknown':
        return !isFirst ? lighten(isHovered ? 0.2 : 0.3, theme.color.bg.dark) : theme.color.bg.dark;
      default:
        return lighten(0.5, theme.color.bg.dark);
    }
  }
}

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
    background: ${(p) => lineColor(p.theme, p.grayed || false, p.state, p.isLastAttempt, true)};
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

export default TimelineRow;
