import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

export const PopoverStyles = css`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.07);
  padding: ${(p) => p.theme.spacer.sm}rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
`;

const PopoverWrapper = styled.div<{ show: boolean }>`
  ${PopoverStyles}
  position: absolute;
  left: 0;
  top: 0;
  display: ${(p) => (p.show ? 'block' : 'none')};
`;

const Popover: React.FC<{ children: ReactNode; show?: boolean }> = ({ children, show = false }) => {
  return (
    <PopoverWrapper className={`popover ${show ? 'show' : 'hide'}`} show={show}>
      {children}
    </PopoverWrapper>
  );
};

export default Popover;