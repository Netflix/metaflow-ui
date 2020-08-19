import React from 'react';
import styled from 'styled-components';
import { GraphState } from './useGraph';
import HorizontalScrollbar from './TimelineHorizontalScroll';
import { formatDuration } from '../../utils/format';

const TimelineFooter: React.FC<{ graph: GraphState; move: (value: number) => void }> = ({ graph, move }) => (
  <GraphFooter>
    <HorizontalScrollbar graph={graph} updateTimeline={(value) => move(value)} />
    <GraphFooterMetrics>
      <div data-testid="timeline-footer-start">{formatDuration(graph.timelineStart - graph.min) || '0s'}</div>
      <div data-testid="timeline-footer-end">{formatDuration(graph.timelineEnd - graph.min)}</div>
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
  position: relative;
`;

export default TimelineFooter;
