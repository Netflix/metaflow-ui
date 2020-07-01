import React, { ReactNode } from 'react';
import styled from 'styled-components';

const PopoverWrapper = styled.div<{ show: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.07);
  padding: ${(p) => p.theme.spacer.sm}rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
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
