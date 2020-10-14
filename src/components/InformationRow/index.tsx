import React from 'react';
import styled from 'styled-components';

const InformationRow: React.FC<{ spaceless?: boolean }> = ({ spaceless = false, children }) => {
  return <StyledRow spaceless={spaceless}>{children}</StyledRow>;
};

const StyledRow = styled.div<{ spaceless: boolean }>`
  overflow: hidden;
  overflow-x: scroll;
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.thinLight};
  padding: ${(p) => (p.spaceless ? '0px' : '10px')};

  &:first-of-type {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  &:last-of-type {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
`;

export default InformationRow;
