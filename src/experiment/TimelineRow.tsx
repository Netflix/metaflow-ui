import React from 'react';
import styled from 'styled-components';
import { Row, GraphState } from './VirtualizedTimeline';
import { color } from '../utils/theme';

const TimelineRow: React.FC<{
  item?: Row;
  graph: GraphState;
  onOpen: () => void;
  sticky?: boolean;
  // Optional end time. Used for steps since they dont have data themselves
  endTime?: number;
}> = ({ item, graph, onOpen, sticky, endTime }) => {
  if (!item) return null;

  const dataItem = item.data;

  const Element = sticky ? StickyStyledRow : StyledRow;

  const finishedAt = endTime || item.data.finished_at;

  const valueFromLeft =
    graph.mode === 'relative'
      ? 0
      : ((dataItem.ts_epoch - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100;

  const width = finishedAt
    ? ((finishedAt - item.data.ts_epoch) / (graph.timelineEnd - graph.timelineStart)) * 100 + '%'
    : '100px';

  return (
    <>
      <Element
        style={{
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
          {item.type === 'task' ? item.data.task_id : dataItem.step_name}
        </RowLabel>
        <RowGraphContainer>
          <BoxGraphic
            style={{
              width: width,
              left: valueFromLeft + '%',
            }}
          ></BoxGraphic>
        </RowGraphContainer>
      </Element>
    </>
  );
};

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
`;

const RowGraphContainer = styled.div`
  position: relative;
  width: 100%;
  border-left: 1px solid #e8e8e8;
  overflow-x: hidden;
`;

const BoxGraphic = styled.div`
  position: absolute;
  background: ${color('secondary')};
  min-width: 10px;
  height: 16px;
  transform: translateY(7px);
`;

export default TimelineRow;
