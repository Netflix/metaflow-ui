import React from 'react';
import styled from 'styled-components';
import { Row } from './VirtualizedTimeline';
import { GraphState } from './useGraph';
import { Link } from 'react-router-dom';

type TimelineRowProps = {
  // Row type and data
  item?: Row;
  // Overall graph state (used to calculate dimensions)
  graph: GraphState;
  onOpen: () => void;
  // Flag row as sticky for some absolute stylings
  sticky?: boolean;
  // Optional end time. Used for steps since they dont have data themselves
  endTime?: number;
};

type LabelPosition = 'left' | 'inside' | 'inside-right' | 'right';

const TimelineRow: React.FC<TimelineRowProps> = ({ item, graph, onOpen, sticky, endTime }) => {
  if (!item) return null;

  const dataItem = item.data;
  const Element = sticky ? StickyStyledRow : StyledRow;
  const finishedAt = endTime || item.data.finished_at;

  // Calculate have much box needs to be pushed from left
  const valueFromLeft =
    graph.mode === 'relative'
      ? 0
      : ((dataItem.ts_epoch - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100;

  const width = finishedAt
    ? ((finishedAt - item.data.ts_epoch) / (graph.timelineEnd - graph.timelineStart)) * 100
    : 100 - valueFromLeft;

  const labelPosition = getLengthLabelPosition(valueFromLeft, width);

  const LabelElement = () => (
    <BoxGraphicValue position={labelPosition}>
      {finishedAt ? ((finishedAt - item.data.ts_epoch) / 1000).toFixed(2) + 's' : '?'}
    </BoxGraphicValue>
  );

  return (
    <>
      <Element
        style={{
          // TODO do this with styled components. But lets see what other states we will have.
          background:
            item.type === 'step'
              ? '#fff'
              : item.data.ts_epoch > graph.timelineEnd || item.data.finished_at < graph.timelineStart
              ? '#f8f8f8'
              : '#fff',
        }}
      >
        <RowLabel
          onClick={() => onOpen()}
          style={{
            cursor: 'pointer',
            background: item.type === 'step' ? '#deecff' : '#fff',
            color: item.type === 'step' ? '#146ee6' : 'gray',
          }}
        >
          {item.type === 'task' ? (
            <Link
              to={`/flows/${item.data.flow_id}/runs/${item.data.run_number}/${item.data.step_name}/${item.data.task_id}`}
            >
              {item.data.task_id}
            </Link>
          ) : (
            dataItem.step_name
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
            {labelPosition !== 'inside' ? <LabelElement /> : null}
          </BoxGraphic>
          {labelPosition === 'inside' ? <LabelElement /> : null}
        </RowGraphContainer>
      </Element>
    </>
  );
};

function getLengthLabelPosition(fromLeft: number, width: number): LabelPosition {
  if (fromLeft + width < 90) {
    return 'right';
  } else if (fromLeft + width > 90 && fromLeft > 10) {
    return 'left';
  } else if (fromLeft + width < 100) {
    return 'inside-right';
  }

  return 'inside';
}

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  min-height: 28px;
  border-bottom: 1px solid #e8e8e8;
  transition: background 0.15s;

  &:hover {
    background: #e8e8e8;
  }
`;

const StickyStyledRow = styled(StyledRow)`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
`;

const RowLabel = styled.div`
  flex: 0 0 150px;
  text-align: right;
  padding: 10px 10px 0;
  font-size: 14px;

  a {
    color: gray;
    text-decoration: none;
  }
`;

const RowGraphContainer = styled.div`
  position: relative;
  width: 100%;
  border-left: 1px solid #e8e8e8;
  overflow-x: hidden;
`;

const BoxGraphic = styled.div<{ root: boolean }>`
  position: absolute;
  background: ${(p) => (p.root ? p.theme.color.bg.blue : p.theme.color.bg.teal)};
  color: ${(p) => (p.root ? p.theme.color.bg.blue : p.theme.color.bg.teal)};
  min-width: 10px;
  height: 16px;
  transform: translateY(7px);
`;

const BoxGraphicValue = styled.div<{ position: LabelPosition }>`
  position: absolute;
  left: ${({ position }) => (position === 'right' ? '100%' : 'auto')};
  right: ${({ position }) =>
    position === 'left' ? '100%' : position === 'inside' || position === 'inside-right' ? '0' : 'auto'};
  top: ${({ position }) => (position === 'inside' ? '6px' : 'auto')};
  color: ${({ position }) => (position === 'inside' || position === 'inside-right' ? '#fff' : 'inherit')};
  padding: 0 10px;
  font-size: 14px;
`;

export default TimelineRow;
