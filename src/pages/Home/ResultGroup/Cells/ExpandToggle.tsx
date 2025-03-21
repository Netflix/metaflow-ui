import React from 'react';
import styled from 'styled-components';
import VerticalToggle from '@/components/VerticalToggle';

export type ExpandToggleProps = {
  onClick: () => void;
  active: boolean;
  visible: boolean;
};

const ExpandToggle: React.FC<ExpandToggleProps> = (props) => {
  return (
    <ToggleContainer>
      <VerticalToggle {...props} />
    </ToggleContainer>
  );
};

const ToggleContainer = styled.div`
  position: absolute;
  left: -1.5rem;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
`;

export default ExpandToggle;
