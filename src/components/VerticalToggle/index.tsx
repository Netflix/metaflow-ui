import React from 'react';
import styled from 'styled-components';
import Icon from '@components/Icon';

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
      <Icon name={active ? 'collapse' : 'expand'} size="xs" />
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
