import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '../../Button';
import Icon from '../../Icon';

const CollapseButton: React.FC<{
  disabled?: boolean;
  expand: () => void;
  collapse: () => void;
  isAnyGroupOpen: boolean;
}> = ({ disabled, expand, collapse, isAnyGroupOpen }) => {
  const { t } = useTranslation();
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
        title={isAnyGroupOpen ? t('timeline.collapse-all') : t('timeline.expand-all')}
      >
        <Icon name={isAnyGroupOpen ? 'collapse' : 'expand'} rotate={isAnyGroupOpen ? 180 : 0} />
      </Button>
    </StyledCollapseButton>
  );
};

const StyledCollapseButton = styled.div`
  position: relative;
  margin-right: 0.25rem;
  button {
    height: 2.5rem;
    width: 2.5rem;
    justify-content: center;
  }
`;

export default CollapseButton;
