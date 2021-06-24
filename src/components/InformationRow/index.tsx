import React from 'react';
import styled from 'styled-components';

//
// Container element with predefined styles.
//

const InformationRow: React.FC<{
  spaceless?: boolean;
  scrollOverflow?: boolean;
  'data-testid'?: string;
}> = ({ spaceless = false, scrollOverflow = true, children, ...rest }) => {
  return (
    <StyledRow spaceless={spaceless} scrollOverflow={scrollOverflow} {...rest}>
      {children}
    </StyledRow>
  );
};

const StyledRow = styled.div<{ spaceless: boolean; scrollOverflow: boolean }>`
  overflow: hidden;
  overflow-x: ${(p) => (p.scrollOverflow ? 'auto' : 'hidden')};
  background: ${(p) => p.theme.color.bg.light};
  border-bottom: ${(p) => p.theme.border.mediumWhite};
  padding: ${(p) => (p.spaceless ? '0px' : '0.625rem')};

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
