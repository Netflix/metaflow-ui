import React from 'react';
import styled from 'styled-components';

//
// @deprecated
// NOTE: This component is not in use anymore. Safe to delete or keep for possible
// future use?
//

//
// Typedef
//

type ToggleProps = {
  value: boolean;
  onClick: () => void;
};

//
// Component
//

const Toggle: React.FC<ToggleProps> = ({ value, onClick }) => {
  return (
    <ToggleContainer selected={value} onClick={onClick}>
      <ToggleIndicator selected={value} />
    </ToggleContainer>
  );
};

//
// Styles
//

const ToggleContainer = styled.div<{ selected: boolean }>`
  height: 24px;
  width: 42px;
  background: ${(p) => (p.selected ? 'var(--color-bg-brand-primary)' : 'var(--color-bg-disabled)')};
  border-radius: 12px;
  transition: background 0.15s;
`;

const ToggleIndicator = styled.div<{ selected: boolean }>`
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #fff;
  position: relative;
  transform: translateX(${(p) => (p.selected ? '19px' : '1px')}) translateY(1px);
  transition: transform 0.15s ease-in-out;
`;

export default Toggle;
