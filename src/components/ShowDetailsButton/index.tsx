import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '../Button';
import Icon from '../Icon';

type Props = {
  toggle: () => void;
  visible: boolean;
  showText?: string;
  hideText?: string;
};

const ShowDetailsButton: React.FC<Props> = ({ toggle, visible, showText, hideText }) => {
  const { t } = useTranslation();

  return (
    <ShowDetailsRow>
      <Button onClick={() => toggle()} textOnly variant="primaryText" size="sm">
        {visible ? hideText || t('component.hide') : showText || t('component.show')}
        <Icon name="arrowDown" rotate={visible ? 180 : 0} padLeft />
      </Button>
    </ShowDetailsRow>
  );
};

const ShowDetailsRow = styled.div`
  padding-top: ${(p) => p.theme.spacer.sm}rem;
  display: flex;
  justify-content: flex-end;
`;

export default ShowDetailsButton;
