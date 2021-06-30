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
  padding: ${(p) => p.theme.spacer.sm}rem;
  background: ${(p) => p.theme.color.bg.white};
  border-radius: 0.25rem;
`;

export const PopoverWrapper = styled.div<{ show: boolean }>`
  ${PopoverStyles}
  position: absolute;
  z-index: 11;
  left: 0;
  top: 0;
  display: ${(p) => (p.show ? 'block' : 'none')};
`;

export default Popover;
