import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Icon from '../Icon';

const CollapseButton: React.FC<{
  disabled?: boolean;
  expand: () => void;
  collapse: () => void;
  isAnyGroupOpen: boolean;
}> = ({ disabled, expand, collapse, isAnyGroupOpen }) => {
  return (
    <StyledCollapseButton>
      <Button
        disabled={disabled}
        onClick={() => {
          if (isAnyGroupOpen) {
            collapse();
          } else {
            expand();
          }
        }}
        data-testid="timeline-collapse-button"
        textOnly
      >
        <Icon name={'arrowDown'} rotate={isAnyGroupOpen ? 180 : 0} />
      </Button>
    </StyledCollapseButton>
  );
};

const StyledCollapseButton = styled.div`
  position: relative;
  margin-right: 0.25rem;
  button {
    height: 36px;
    width: 36px;
    justify-content: center;
  }
`;

export default CollapseButton;
