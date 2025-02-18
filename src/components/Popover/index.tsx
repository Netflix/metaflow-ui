import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

//
// Fixed container for popups
//

const Popover: React.FC<{ children: ReactNode; show?: boolean }> = ({ children, show = false }) => {
  return (
    <PopoverWrapper className={`popover ${show ? 'show' : 'hide'}`} show={show} data-testid="popup-wrapper">
      {children}
    </PopoverWrapper>
  );
};

//
// Style
//

export const PopoverStyles = css`
  border: 1px solid #d0d0d0;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.25));
  padding: var(--spacing-3);
  background: var(--color-bg-primary);
  border-radius: var(--radius-primary);
`;

export const PopoverWrapper = styled.div<{ show: boolean; alignment?: 'left' | 'right' }>`
  ${PopoverStyles}
  position: absolute;
  z-index: 11;
  left: ${(p) => (p.alignment === 'right' ? 'auto' : '0')};
  right: ${(p) => (p.alignment === 'right' ? '0' : 'auto')};
  top: 0;
  display: ${(p) => (p.show ? 'block' : 'none')};
`;

export default Popover;
