import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Breadcrumb from '@components/Breadcrumb';
import ConnectionStatus from '@components/ConnectionStatus';
import HelpMenu from '@components/HelpMenu';
import PluginGroup from '@components/Plugins/PluginGroup';
import { ItemRow } from '@components/Structure';
import FEATURE_FLAGS from '@utils/FEATURE';
import logo from '@assets/logo_dark_horizontal.svg';

type Props = {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
};

const AppBar: React.FC<Props> = ({ toggleTheme, currentTheme }) => {
  return (
    <Wrapper>
      <ItemRow pad="lg">
        {!FEATURE_FLAGS.HIDE_LOGO && (
          <LogoLink to={'/'}>
            <Logo data-testid="page-logo-image" src={logo} />
          </LogoLink>
        )}

        <Breadcrumb />

        <RightSection>
          {!FEATURE_FLAGS.HIDE_QUICK_LINKS && <HelpMenu />}
          {!FEATURE_FLAGS.HIDE_CONNECTION_STATUS && <ConnectionStatus />}

          {/* 🌙 Toggle */}
          <ThemeButton onClick={toggleTheme}>{currentTheme === 'light' ? '🌙' : '☀️'}</ThemeButton>
        </RightSection>
      </ItemRow>

      <ItemRow pad="lg">
        <PluginGroup id="header" title="Extensions" slot="header" />
      </ItemRow>
    </Wrapper>
  );
};

export default AppBar;

//
// Styles
//

const Wrapper = styled.header`
  max-width: var(--layout-max-width);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  min-height: var(--layout-application-bar-height);
  margin: 0 auto;
  padding: var(--layout-page-padding-y) var(--layout-page-padding-x);
  background: ${({ theme }) => theme.navbar};
  color: ${({ theme }) => theme.text};
  z-index: 999;
  flex-direction: column;
`;

const Logo = styled.img`
  height: var(--layout-application-bar-logo-height);
`;

const LogoLink = styled(Link)`
  margin-right: 1.7rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 10px;
`;

const ThemeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 34px;

  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.text}20;

  background: ${({ theme }) => theme.navbar};
  color: ${({ theme }) => theme.text};

  cursor: pointer;
  transition: all 0.2s ease;

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.3);

  &:hover {
    background: ${({ theme }) => theme.text}15;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;
