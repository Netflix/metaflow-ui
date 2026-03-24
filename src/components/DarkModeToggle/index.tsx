import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@components/ThemeProvider';
import moonIcon from '@assets/moon.svg';
import sunIcon from '@assets/sun.svg';

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="dark-mode-toggle"
    >
      <IconMask iconUrl={isDark ? sunIcon : moonIcon} />
    </ToggleButton>
  );
};

export default DarkModeToggle;

//
// Style
//

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.375rem;
  height: 2.375rem;
  border-radius: var(--radius-primary);
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--color-text-secondary);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-color: rgba(128, 128, 128, 0.5);
  }
`;

const IconMask = styled.span<{ iconUrl: string }>`
  display: block;
  width: 1rem;
  height: 1rem;
  background-color: currentColor;
  -webkit-mask: url(${(p) => p.iconUrl}) no-repeat center;
  mask: url(${(p) => p.iconUrl}) no-repeat center;
  -webkit-mask-size: contain;
  mask-size: contain;
`;
