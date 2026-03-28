import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ThemeContext } from '@components/ThemeProvider';

//
// Theme toggle for use in HelpMenu. Simple switch between light and dark modes.
//

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <ToggleRow>
      <Label>{t('help.theme')}</Label>
      <ToggleButton onClick={toggleTheme} role="switch" aria-checked={isDark} data-testid="theme-toggle">
        <Track $active={isDark}>
          <Thumb $active={isDark} />
        </Track>
        <ToggleLabel>{isDark ? t('help.theme-dark') : t('help.theme-light')}</ToggleLabel>
      </ToggleButton>
    </ToggleRow>
  );
};

export default ThemeToggle;

//
// Style
//

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.5rem;
`;

const Label = styled.span`
  color: var(--color-text-secondary);
  font-size: var(--font-size-primary);
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  min-height: auto;
  border-radius: var(--radius-primary);

  &:hover {
    background: var(--color-bg-secondary);
  }
`;

const Track = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 2rem;
  height: 1.125rem;
  border-radius: 1rem;
  background: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-border-primary)')};
  position: relative;
  transition: background 0.2s;
`;

const Thumb = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 0.125rem;
  left: ${(p) => (p.$active ? 'calc(100% - 1rem)' : '0.125rem')};
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background: var(--color-bg-primary);
  transition: left 0.2s;
`;

const ToggleLabel = styled.span`
  color: var(--color-text-secondary);
  font-size: var(--font-size-4);
`;
