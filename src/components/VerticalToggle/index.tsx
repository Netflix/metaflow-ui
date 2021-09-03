import React from 'react';
import styled, { css } from 'styled-components';

//
// Typedef
//

type Props = {
  active: boolean;
  onClick: () => void;
  visible: boolean;
};

//
// Component
//

const VerticalToggle: React.FC<Props> = ({ visible, active, onClick }) => {
  return (
    <ToggleContainer data-testid="vertical-toggle" onClick={onClick} show={visible}>
      <StyledToggle active={active} />
    </ToggleContainer>
  );
};

export default VerticalToggle;

//
// Style
//

const ToggleContainer = styled.div<{ show: boolean }>`
  padding: 0.625rem;
  transition: 0.15s opacity;
  opacity: ${(p) => (p.show ? '1' : '0')};
`;

const StyledToggle = styled.div<{ active: boolean }>`
  width: 0.125rem;
  height: 1.125rem;
  background: ${(p) => p.theme.color.border.dark};
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 50%;
    border: 0.125rem solid ${(p) => p.theme.color.text.mid};
    background: white;
    transform: translateY(-0.125rem) translateX(-0.25rem);
    transition: 0.2s transform cubic-bezier(0.44, 1.89, 0.55, 0.79), width 0.25s, 0.15s background, 0.15s border;

    ${(p) =>
      p.active &&
      css`
        border: 0.125rem solid ${(p) => p.theme.color.text.blue};
        background: ${(p) => p.theme.color.text.blue};
        transform: translateY(0.75rem) translateX(-0.25rem);
      `}
  }
`;
