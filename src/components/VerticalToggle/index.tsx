import React from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

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
      <Icon name="arrowDown" size="md" rotate={active ? 180 : 0} />
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
