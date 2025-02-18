import React from 'react';
import styled from 'styled-components';

//
// Container element with predefined styles.
//

const InformationRow: React.FC<{
  spaceless?: boolean;
  scrollOverflow?: boolean;
  'data-testid'?: string;
  children?: React.ReactNode;
}> = ({ spaceless = false, scrollOverflow = true, children, ...rest }) => {
  return (
    <StyledRow spaceless={spaceless} {...rest}>
      {children}
    </StyledRow>
  );
};

const StyledRow = styled.div<{ spaceless: boolean }>`
  background: var(--color-bg-secondary);
  border-bottom: var(--border-alternative-medium);
  padding: ${(p) => (p.spaceless ? '0px' : '0.625rem')};

  &:first-of-type {
    border-top-left-radius: var(--radius-primary);
    border-top-right-radius: var(--radius-primary);
  }
  &:last-of-type {
    border-bottom-left-radius: var(--radius-primary);
    border-bottom-right-radius: var(--radius-primary);
  }
`;

export default InformationRow;
