import React from 'react';

import styled from 'styled-components';
import { formatDuration } from '../../../utils/format';

//
// Typedef
//

export type MinimalFooterProps = {
  startTime: number;
  visibleStartTime: number;
  visibleEndtime: number;
};

//
// Component
//

const MinimalFooter: React.FC<MinimalFooterProps> = ({ startTime, visibleStartTime, visibleEndtime }) => {
  return (
    <MinimalFooterContainer>
      <MinimalFooterLabel>{formatDuration(visibleStartTime - startTime)}</MinimalFooterLabel>
      <MinimalFooterLabel>{formatDuration(visibleEndtime - startTime)}</MinimalFooterLabel>
    </MinimalFooterContainer>
  );
};

//
// Style
//

const MinimalFooterContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
`;

const MinimalFooterLabel = styled.div`
  font-size: 0.875rem;
`;

export default MinimalFooter;
