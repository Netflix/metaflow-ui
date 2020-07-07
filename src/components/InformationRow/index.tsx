import React from 'react';
import styled from 'styled-components';

const InformationRow: React.FC<{ spaceless?: boolean }> = ({ spaceless = false, children }) => {
  return <StyledRow spaceless={spaceless}>{children}</StyledRow>;
};

const StyledRow = styled.div<{ spaceless: boolean }>`
  overflow: hidden;
  background: ${({ theme }) => theme.color.bg.light};
  border-bottom: ${({ theme }) => '1px solid ' + theme.color.border.normal};
  padding: ${(props) => (props.spaceless ? '0px' : '10px')};

  &:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export default InformationRow;
