import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';
import Breadcrumb from '../Breadcrumb';
import { ItemRow } from '../Structure';
import HelpMenu from '../HelpMenu';
import ConnectionStatus from '../ConnectionStatus';
import PluginGroup from '../Plugins/PluginGroup';

//
// Main application bar which is always shown on top of the page
//

const AppBar: React.FC = () => {
  return (
    <Wrapper>
      <ConnectionStatusWrapper>
        <ConnectionStatus />
      </ConnectionStatusWrapper>
      <ItemRow pad="lg">
        <LogoLink to={'/'}>
          <Logo data-testid="page-logo-image" src={logo} />
        </LogoLink>
        <Breadcrumb />
        <HelpMenu />
      </ItemRow>
      <ItemRow pad="lg">
        <PluginGroup id="header" title="Extensions" slot="header" />
      </ItemRow>
    </Wrapper>
  );
};

export default AppBar;

//
// Style
//

const Wrapper = styled.header`
  max-width: ${(p) => p.theme.layout.maxWidth}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  min-height: ${(p) => p.theme.layout.appbarHeight}rem;
  margin: 0 auto;
  padding: 0 ${(p) => p.theme.layout.pagePaddingX}rem;
  background: ${(p) => p.theme.color.bg.white};
  z-index: 999;
  flex-direction: column;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
`;

const LogoLink = styled(Link)`
  margin-right: 1.7rem;
`;

const ConnectionStatusWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-top: ${(p) => p.theme.spacer.md}rem;
`;
