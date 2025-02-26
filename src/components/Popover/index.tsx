import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import InputWrapper from '../Form/InputWrapper';

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
  border: var(--popover-border);
  box-shadow: var(--popover-shadow);
  padding: var(--popover-padding);
  background: var(--popover-background);
  border-radius: var(--popover-border-radius);

  ${InputWrapper} {
    background: var(--popover-background);
  }
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
