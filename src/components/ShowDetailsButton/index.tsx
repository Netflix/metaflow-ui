import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '@components/Button';
import Icon from '@components/Icon';

type Props = {
  toggle: () => void;
  visible: boolean;
  showText?: string;
  hideText?: string;
  'data-testid'?: string;
};

const ShowDetailsButton: React.FC<Props> = ({ toggle, visible, showText, hideText, ...rest }) => {
  const { t } = useTranslation();

  return (
    <ShowDetailsRow {...rest}>
      <Button onClick={() => toggle()} textOnly variant="primaryText" size="sm">
        {visible ? hideText || t('component.hide') : showText || t('component.show')}
        <Icon name="arrowDown" rotate={visible ? 180 : 0} padLeft />
      </Button>
    </ShowDetailsRow>
  );
};

const ShowDetailsRow = styled.div`
  padding-top: var(--spacing-3);
  display: flex;
  justify-content: flex-end;
`;

export default ShowDetailsButton;
