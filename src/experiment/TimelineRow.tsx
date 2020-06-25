import React from 'react';
import styled from 'styled-components';
import { Row, GraphState } from './VirtualizedTimeline';
import { color } from '../utils/theme';

const TimelineRow: React.FC<{
  item?: Row;
  graph: GraphState;
  onOpen: () => void;
  sticky?: boolean;
}> = ({ item, graph, onOpen, sticky }) => {
  if (!item) return null;

  const dataItem = item.data;

  const Element = sticky ? StickyStyledRow : StyledRow;

  return (
    <>
      <Element
        style={{
          background:
            dataItem.ts_epoch < graph.timelineStart || dataItem.ts_epoch > graph.timelineEnd ? '#f8f8f8' : '#fff',
        }}
      >
        <RowLabel onClick={() => onOpen()} style={{ cursor: 'pointer' }}>
          {item.type === 'task' ? item.data.task_id : dataItem.step_name}
        </RowLabel>
        <RowGraphContainer>
          <BoxGraphic
            style={{
              left:
                graph.mode === 'relative'
                  ? 0
                  : `${((dataItem.ts_epoch - graph.timelineStart) / (graph.timelineEnd - graph.timelineStart)) * 100}%`,
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
  min-width: 100px;
  height: 16px;
  transform: translateY(7px);
`;

export default TimelineRow;
