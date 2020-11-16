import React from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { Row } from './VirtualizedTimeline';
import { GraphState } from './useGraph';
import { useHistory } from 'react-router-dom';
import { getPath } from '../../utils/routing';
import { Step, Task } from '../../types';
import { formatDuration } from '../../utils/format';
import { lighten } from 'polished';
import { TFunction } from 'i18next';
import TaskListLabel from './TaskListLabel';

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
            duration={item.rowObject.duration}
          />
        ) : (
          <TaskListLabel
            type="task"
            item={item.data[item.data.length - 1]}
            open={isOpen}
            duration={item.data[item.data.length - 1].duration || null}
            grouped={isGrouped}
            paramsString={paramsString}
            t={t}
          />
        )}
        <RowGraphContainer data-testid="timeline-row-graphic-container">
          {item.type === 'step' ? (
            <BoxGraphicElement
              graph={graph}
              row={{ type: 'step', data: item.data }}
              grayed={isOpen}
              duration={item.rowObject.duration}
              labelDuration={item.rowObject.duration}
              onOpen={onOpen}
              isFailed={item.rowObject.isFailed}
              isLastAttempt
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
              />
            ))
          )}
        </RowGraphContainer>
      </Element>
    </>
  );
};

type BoxGraphicElementProps = {
  row: { type: 'step'; data: Step } | { type: 'task'; data: Task };
  graph: GraphState;
  grayed?: boolean;
  isFailed?: boolean;
  isLastAttempt: boolean;
  duration: number | null;
  labelDuration?: number | null;
  onOpen?: () => void;
  startTimeOfFirstAttempt?: number;
};

export const BoxGraphicElement: React.FC<BoxGraphicElementProps> = ({
  row,
  graph,
  grayed,
  isFailed,
  isLastAttempt,
  duration,
  labelDuration,
  onOpen,
  startTimeOfFirstAttempt,
}) => {
  const { push } = useHistory();
  const visibleDuration = graph.timelineEnd - graph.timelineStart + (graph.timelineEnd - graph.timelineStart) * 0.01;
  const boxStartTime = row.type === 'step' ? row.data.ts_epoch : row.data.started_at || row.data.ts_epoch;

  // Calculate have much box needs to be pushed from (or to) left
  const valueFromLeft =
    graph.alignment === 'fromLeft'
      ? ((graph.min - graph.timelineStart + (startTimeOfFirstAttempt ? boxStartTime - startTimeOfFirstAttempt : 0)) /
          visibleDuration) *
        100
      : ((boxStartTime - graph.timelineStart) / visibleDuration) * 100;

  const width = duration ? (duration / visibleDuration) * 100 : 100 - valueFromLeft;

  const labelPosition = getLengthLabelPosition(valueFromLeft, width);

  return (
    <div style={{ width: '100%', transform: `translateX(${valueFromLeft}%)` }} data-testid="boxgraphic-container">
      <BoxGraphic
        root={row.type === 'step'}
        style={{
          width: width + '%',
        }}
        onClick={() => {
          if (row.type === 'task') {
            push(getPath.task(row.data.flow_id, row.data.run_number, row.data.step_name, row.data.task_id));
          } else {
            if (onOpen) {
              onOpen();
            }
          }
        }}
        data-testid="boxgraphic"
      >
        {isLastAttempt && labelDuration && (
          <RowMetricLabel duration={labelDuration} labelPosition={labelPosition} data-testid="boxgraphic-label" />
        )}
        <BoxGraphicLine grayed={grayed} state={getRowStatus(row, isFailed)} isLastAttempt={isLastAttempt} />
        <BoxGraphicMarkerStart />
        <BoxGraphicMarkerEnd />
      </BoxGraphic>
    </div>
  );
};

function getRowStatus(row: { type: 'step'; data: Step } | { type: 'task'; data: Task }, isFailed?: boolean): string {
  if (row.type === 'step') {
    return isFailed ? 'failed' : 'completed';
  } else {
    if (row.data.status) {
      return row.data.status;
    } else {
      return row.data.finished_at ? 'completed' : 'running';
    }
  }
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

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  min-height: 28px;
  border-bottom: ${(p) => p.theme.border.thinLight};
  transition: background 0.15s;

  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: ${(p) => p.theme.color.bg.white};
  top: 0;
  left: 0;
`;

const RowGraphContainer = styled.div`
  position: relative;
  width: 100%;
  border-left: ${(p) => p.theme.border.thinLight};
  overflow-x: hidden;
  cursor: grab;
`;

const BoxGraphic = styled.div<{ root: boolean }>`
  position: absolute;
  cursor: pointer;
  color: ${(p) => p.theme.color.text.dark};
  min-width: 10px;
  height: 27px;
  line-height: 27px;
`;

function lineColor(theme: DefaultTheme, grayed: boolean, state: string, isFirst: boolean, isHovered?: boolean) {
  if (grayed) {
    return '#c7c7c7';
  } else {
    switch (state) {
      case 'completed':
        return !isFirst ? lighten(isHovered ? 0.2 : 0.3, theme.color.bg.red) : theme.color.bg.green;
      case 'running':
        return theme.color.bg.yellow;
      case 'failed':
        return !isFirst ? lighten(isHovered ? 0.2 : 0.3, theme.color.bg.red) : theme.color.bg.red;
      default:
        return theme.color.bg.red;
    }
  }
}

const BoxGraphicLine = styled.div<{ grayed?: boolean; state: string; isLastAttempt: boolean }>`
  position: absolute;
  background: ${(p) => lineColor(p.theme, p.grayed || false, p.state, p.isLastAttempt)};
  width: 100%;
  height: 6px;
  top: 50%;
  transform: translateY(-50%);
  transition: background 0.15s;

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

const BoxGraphicValue = styled.div<{ position: LabelPosition }>`
  position: absolute;
  left: ${({ position }) => (position === 'right' ? '100%' : 'auto')};
  right: ${({ position }) => (position === 'left' ? '100%' : 'auto')};
  background: rgba(255, 255, 255, 0.8);
  padding: 0 10px;
  top: 1px;
  line-height: 26px;
  font-size: 12px;
  white-space: nowrap;
`;

export default TimelineRow;
