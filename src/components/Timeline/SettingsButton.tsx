import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Icon from '../Icon';

const SettingsButton: React.FC<{
  disabled?: boolean;
  expand: () => void;
  collapse: () => void;
  isAnyGroupOpen: boolean;
}> = ({ disabled, expand, collapse, isAnyGroupOpen }) => {
  return (
    <StyledSettingsButton>
      <Button
        disabled={disabled}
        onClick={() => {
          if (isAnyGroupOpen) {
            collapse();
          } else {
            expand();
          }
        }}
        data-testid="timeline-settings-button"
        textOnly
      >
        <Icon name={'arrowDown'} rotate={isAnyGroupOpen ? 180 : 0} />
      </Button>
    </StyledSettingsButton>
  );
};

const StyledSettingsButton = styled.div`
  position: relative;
  margin-left: 0.25rem;
  button {
    height: 30px;
  }
`;

export default SettingsButton;
