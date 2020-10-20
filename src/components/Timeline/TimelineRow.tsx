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
  // Optional end time. Used for steps since they dont have data themselves
  endTime?: number;
  t: TFunction;
};

type LabelPosition = 'left' | 'right' | 'none';

const TimelineRow: React.FC<TimelineRowProps> = ({
  item,
  graph,
  onOpen,
  isOpen = true,
  isGrouped,
  sticky,
  endTime,
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
            duration={endTime ? endTime - item.data.ts_epoch : 0}
            toggle={onOpen}
            open={isOpen}
            grouped={isGrouped}
            t={t}
          />
        ) : (
          <TaskListLabel type="task" item={item.data[0]} open={isOpen} grouped={isGrouped} t={t} />
        )}
        <RowGraphContainer data-testid="timeline-row-graphic-container">
          {item.type === 'step' ? (
            <BoxGraphicElement
              graph={graph}
              row={{ type: 'step', data: item.data }}
              grayed={isOpen}
              finishedAt={endTime}
              onOpen={onOpen}
              isFirst
            />
          ) : (
            item.data
              .sort((a, b) => (b.finished_at || 0) - (a.finished_at || 0))
              .map((task, index) => (
                <BoxGraphicElement
                  key={task.finished_at}
                  graph={graph}
                  row={{ type: 'task', data: task }}
                  isFirst={index === 0}
                  finishedAt={task.finished_at}
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
  finishedAt: number | undefined;
  grayed?: boolean;
  isFirst: boolean;
  onOpen?: () => void;
};

export const BoxGraphicElement: React.FC<BoxGraphicElementProps> = ({
  row,
  graph,
  finishedAt,
  grayed,
  isFirst,
  onOpen,
}) => {
  const { push } = useHistory();
  const visibleDuration = graph.timelineEnd - graph.timelineStart;

  // Calculate have much box needs to be pushed from (or to) left
  const valueFromLeft =
    graph.alignment === 'fromLeft'
      ? ((graph.min - graph.timelineStart) / visibleDuration) * 100
      : ((row.data.ts_epoch - graph.timelineStart) / visibleDuration) * 100;

  const width = finishedAt ? ((finishedAt - row.data.ts_epoch) / visibleDuration) * 100 : 100 - valueFromLeft;

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
        {isFirst && (
          <RowMetricLabel
            item={row.data}
            finishedAt={finishedAt}
            labelPosition={labelPosition}
            data-testid="boxgraphic-label"
          />
        )}
        <BoxGraphicLine
          grayed={grayed}
          state={row.type === 'task' && row.data.status ? row.data.status : finishedAt ? 'completed' : 'running'}
          isFirst={isFirst}
        />
        <BoxGraphicMarkerStart />
        <BoxGraphicMarkerEnd />
      </BoxGraphic>
    </div>
  );
};

const RowMetricLabel: React.FC<{
  item: Task | Step;
  finishedAt?: number;
  labelPosition: LabelPosition;
  'data-testid'?: string;
}> = ({ item, finishedAt, labelPosition, ...rest }) =>
  labelPosition === 'none' ? null : (
    <BoxGraphicValue position={labelPosition} {...rest}>
      {finishedAt ? formatDuration(finishedAt - item.ts_epoch, 1) : '?'}
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

function lineColor(theme: DefaultTheme, grayed: boolean, state: string, isFirst: boolean) {
  if (grayed) {
    return '#c7c7c7';
  } else {
    switch (state) {
      case 'completed':
        return !isFirst ? lighten(0.3, theme.color.bg.red) : theme.color.bg.green;
      case 'running':
        return theme.color.bg.yellow;
      case 'failed':
        return !isFirst ? lighten(0.3, theme.color.bg.red) : theme.color.bg.red;
      default:
        return theme.color.bg.red;
    }
  }
}

const BoxGraphicLine = styled.div<{ grayed?: boolean; state: string; isFirst: boolean }>`
  position: absolute;
  background: ${(p) => lineColor(p.theme, p.grayed || false, p.state, p.isFirst)};
  width: 100%;
  height: 6px;
  top: 50%;
  transform: translateY(-50%);
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
  padding: 0 10px;
  font-size: 12px;
  white-space: nowrap;
`;

export default TimelineRow;
