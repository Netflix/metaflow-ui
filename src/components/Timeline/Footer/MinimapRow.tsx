import React from 'react';
import styled from 'styled-components';
import { TaskStatus } from '../../../types';
import { lineColor } from '../TimelineRow/utils';
import { GraphState } from '../useGraph';

//
// Typedef
//

type MinimapRowProps = {
  started: number;
  finished: number;
  status: TaskStatus;
  graph: GraphState;
};

//
// Component
//
const MinimapRow: React.FC<MinimapRowProps> = ({ started, finished, status, graph }) => {
  const extendAmount = (graph.max - graph.min) * 0.01;
  const visibleDuration = graph.max - graph.min + extendAmount;
  const width = ((finished - started) / visibleDuration) * 100;
  const left = graph.sortBy === 'duration' ? 0 : ((started - graph.min) / visibleDuration) * 100;

  return (
    <MinimapLine
      status={status}
      style={{
        width: width + '%',
        left: left + '%',
      }}
    ></MinimapLine>
  );
};

//
// Style
//

const MinimapLine = styled.div<{ status: TaskStatus }>`
  position: relative;
  background: ${(p) => lineColor(p.theme, false, p.status, true)};
  height: 2px;
  min-height: 2px;
  margin-bottom: 1px;
  min-width: 2px;
  transition: width 0.5s, left 0.5s;
`;

export default MinimapRow;
