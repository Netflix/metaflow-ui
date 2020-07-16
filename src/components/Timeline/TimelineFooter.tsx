import React from 'react';
import styled from 'styled-components';
import { GraphState } from './useGraph';
import HorizontalScrollbar from './TimelineHorizontalScroll';

const TimelineFooter: React.FC<{ graph: GraphState; move: (value: number) => void }> = ({ graph, move }) => (
  <GraphFooter>
    <HorizontalScrollbar graph={graph} updateTimeline={(value) => move(value)} />
    <GraphFooterMetrics>
      <div>{((graph.timelineStart - graph.min) / 1000).toFixed(2)}s</div>
      <div>{((graph.timelineEnd - graph.min) / 1000).toFixed(2)}s</div>
    </GraphFooterMetrics>
  </GraphFooter>
);

const GraphFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 225px;
`;

const GraphFooterMetrics = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 1rem;
  font-size: 14px;
`;

export default TimelineFooter;
