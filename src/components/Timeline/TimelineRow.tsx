import React from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { Row } from './VirtualizedTimeline';
import { GraphState } from './useGraph';
import { Link } from 'react-router-dom';
import { getPath } from '../../utils/routing';
import Icon from '../Icon';

type TimelineRowProps = {
  // Row type and data
  item?: Row;
  // Overall graph state (used to calculate dimensions)
  graph: GraphState;
  onOpen: () => void;
  isOpen?: boolean;
  // Flag row as sticky for some absolute stylings
  sticky?: boolean;
  // Optional end time. Used for steps since they dont have data themselves
  endTime?: number;
};

type LabelPosition = 'left' | 'right' | 'none';

const TimelineRow: React.FC<TimelineRowProps> = ({ item, graph, onOpen, isOpen, sticky, endTime }) => {
  if (!item) return null;

  const dataItem = item.data;
  const Element = sticky ? StickyStyledRow : StyledRow;
  const finishedAt = endTime || item.data.finished_at;

  const visibleDuration = graph.timelineEnd - graph.timelineStart;

  // Calculate have much box needs to be pushed from (or to) left
  const valueFromLeft =
    graph.alignment === 'fromLeft'
      ? ((graph.min - graph.timelineStart) / visibleDuration) * 100
      : ((dataItem.ts_epoch - graph.timelineStart) / visibleDuration) * 100;

  const width = finishedAt ? ((finishedAt - item.data.ts_epoch) / visibleDuration) * 100 : 100 - valueFromLeft;

  const labelPosition = getLengthLabelPosition(valueFromLeft, width);

  return (
    <>
      <Element>
        <RowLabel onClick={() => onOpen()} type={item.type} isOpen={isOpen} group={graph.groupBy}>
          {item.type === 'task' ? (
            <Link to={getPath.task(item.data.flow_id, item.data.run_number, item.data.step_name, item.data.task_id)}>
              <RowStepName>{graph.groupBy === 'none' ? item.data.step_name : ''}</RowStepName>
              <span>
                {graph.groupBy === 'none' ? '/' : ''}
                {item.data.task_id}
              </span>
            </Link>
          ) : (
            <StepLabel>
              <Icon name="arrowDown" rotate={isOpen ? 180 : 0} />
              <div>{dataItem.step_name}</div>
            </StepLabel>
          )}
        </RowLabel>
        <RowGraphContainer>
          <BoxGraphic
            root={item.type === 'step'}
            style={{
              width: width + '%',
              left: valueFromLeft + '%',
            }}
          >
            <RowMetricLabel item={item} finishedAt={finishedAt} labelPosition={labelPosition} />
            <BoxGraphicLine
              grayed={item.type === 'step' && isOpen}
              state={endTime || item.data.finished_at ? 'completed' : 'running'}
            />
            <BoxGraphicMarkerStart />
            <BoxGraphicMarkerEnd />
          </BoxGraphic>
        </RowGraphContainer>
      </Element>
    </>
  );
};

const RowMetricLabel: React.FC<{ item: Row; finishedAt?: number; labelPosition: LabelPosition }> = ({
  item,
  finishedAt,
  labelPosition,
}) =>
  labelPosition === 'none' ? null : (
    <BoxGraphicValue position={labelPosition}>
      {finishedAt ? ((finishedAt - item.data.ts_epoch) / 1000).toFixed(2) + 's' : '?'}
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
  border-bottom: 1px solid #e8e8e8;
  transition: background 0.15s;

  &:hover {
    background: #f6f6f6;
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
`;

const RowLabel = styled.div<{ type: 'step' | 'task'; isOpen?: boolean; group?: 'none' | 'step' }>`
  flex: 0 0 225px;
  max-width: 225px;
  overflow: hidden;
  cursor: pointer;
  text-align: right;
  font-size: ${(p) => (p.type === 'task' ? '12px' : '14px')};
  font-weight: ${(p) => (p.type === 'step' ? '600' : 'normal')};
  background: ${(p) => (p.type === 'step' && p.isOpen ? '#f6f6f6' : '#fff')};
  font-family: monospace;
  line-height: 27px;
  padding: 0 0.25rem;

  a {
    color: gray;
    text-decoration: none;
    min-width: ${(p) => (p.group === 'none' ? '100%' : '50%')};
    background: #f6f6f6;
    display: inline-block;
    margin-right: -0.25rem;
    margin-left: -0.25rem;
    padding-right: 0.25rem;
    padding-left: 0.25rem;

    ${(p) =>
      p.group === 'none'
        ? css`
            display: flex;
            justify-content: flex-end;
          `
        : ''}
  }

  i {
    line-height: 0px;
  }
  @media screen and (max-width: 765px) {
    flex: 0 0 100px;
    max-width: 100px;
  }
`;

const RowStepName = styled.span`
  overflow: hidden;
`;

const StepLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RowGraphContainer = styled.div`
  position: relative;
  width: 100%;
  border-left: 1px solid #e8e8e8;
  overflow-x: hidden;
  cursor: grab;
`;

const BoxGraphic = styled.div<{ root: boolean }>`
  position: absolute;
  color: ${(p) => p.theme.color.text.dark};
  min-width: 10px;
  height: 27px;
  line-height: 27px;
`;

function lineColor(theme: DefaultTheme, grayed: boolean, state: string) {
  if (grayed) {
    return '#c7c7c7';
  } else {
    switch (state) {
      case 'completed':
        return theme.color.bg.green;
      case 'running':
        return theme.color.bg.yellow;
      default:
        return theme.color.bg.red;
    }
  }
}

const BoxGraphicLine = styled.div<{ grayed?: boolean; state: string }>`
  position: absolute;
  background: ${(p) => lineColor(p.theme, p.grayed || false, p.state)};
  width: 100%;
  height: 6px;
  top: 50%;
  transform: translateY(-50%);
`;

const BoxGraphicMarker = css`
  height: 3px;
  width: 1px;
  background: #717171;
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
`;

export default TimelineRow;
