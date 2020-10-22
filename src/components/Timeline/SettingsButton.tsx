import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '../Button';
import Icon from '../Icon';

const SettingsButton: React.FC<{
  expand: () => void;
  collapse: () => void;
}> = ({ expand, collapse }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <StyledSettingsButton>
      <Button active={open} onClick={() => setOpen(!open)} data-testid="timeline-settings-button">
        <Icon name="listing" size="xs" />
      </Button>
      {open && (
        <>
          <TemporaryPopup>
            <Button
              onClick={() => {
                expand();
                setOpen(false);
              }}
              data-testid="timeline-settings-expand-all"
              withIcon
            >
              <Icon name="expand" />
              <span>{t('timeline.expand-all')}</span>
            </Button>

            <Button
              onClick={() => {
                collapse();
                setOpen(false);
              }}
              data-testid="timeline-settings-collapse-all"
              withIcon
            >
              <Icon name="collapse" />
              <span>{t('timeline.collapse-all')}</span>
            </Button>
          </TemporaryPopup>
          <PopupClickOverlay onClick={() => setOpen(false)} />
        </>
      )}
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

const TemporaryPopup = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  padding: 10px;
  background: ${(p) => p.theme.color.bg.white};
  border: ${(p) => p.theme.border.thinMid};
  z-index: 2;
  white-space: nowrap;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.06);

  button {
    margin-top: 0.5rem;
    width: 100%;

    &:first-of-type {
      margin-top: 1rem;
    }
  }
`;

const PopupClickOverlay = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
`;

export default SettingsButton;
