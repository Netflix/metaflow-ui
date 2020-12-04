import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { GraphMode } from '../../Timeline/useGraph';
import Button from '../../Button';
import ButtonGroup from '../../ButtonGroup';

//
// Typedef
//
type Props = {
  activeMode: GraphMode;
  select: (mode: GraphMode) => void;
};

//
// Component
//

const ModeSelector: React.FC<Props> = ({ activeMode, select }) => {
  const { t } = useTranslation();

  return (
    <ModeContainer>
      <ButtonGroup big>
        <ModeButton active={activeMode === 'overview'} onClick={() => select('overview')} label={t('run.overview')} />
        <ModeButton
          active={activeMode === 'monitoring'}
          onClick={() => select('monitoring')}
          label={t('run.monitoring')}
        />
        <ModeButton
          active={activeMode === 'error-tracker'}
          onClick={() => select('error-tracker')}
          label={t('run.error-tracker')}
        />
        <ModeButton active={activeMode === 'custom'} onClick={() => select('custom')} label={t('run.custom')} />
      </ButtonGroup>
    </ModeContainer>
  );
};

//
// Extra component
//

type ModeButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

const ModeButton: React.FC<ModeButtonProps> = ({ active, onClick, label }) => (
  <Button active={active} onClick={onClick}>
    {label}
    <ActivityPointer active={active} />
  </Button>
);

//
// Style
//

const ModeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  .button {
    position: relative;
  }
`;

const BaseArrowCSS = css`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.15s;
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 9px solid #e9e9e9;
`;

const ActivityPointer = styled.div<{ active: boolean }>`
  ${(p) => !p.active && 'display: none;'}
  ${BaseArrowCSS}
  top: 100%;

  &::after {
    content: '';
    ${BaseArrowCSS}
    border-bottom: 6px solid #f6f6f6;
    top: 4px;
  }
`;

export default ModeSelector;
