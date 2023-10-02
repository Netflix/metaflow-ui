import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';
import Breadcrumb from '../Breadcrumb';
import { ItemRow } from '../Structure';
import HelpMenu from '../HelpMenu';
import ConnectionStatus from '../ConnectionStatus';
import FEATURE_FLAGS from '../../utils/FEATURE';
import PluginGroup from '../Plugins/PluginGroup';

//
// Main application bar which is always shown on top of the page
//

const AppBar: React.FC = () => {
  return (
    <Wrapper>
      <ItemRow pad="lg">
        {!FEATURE_FLAGS.HIDE_LOGO && (
          <LogoLink to={'/'}>
            <Logo data-testid="page-logo-image" src={logo} />
          </LogoLink>
        )}
        <Breadcrumb />
        {!FEATURE_FLAGS.HIDE_QUICK_LINKS && <HelpMenu />}
        <ConnectionStatus />
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
  justify-content: flex-start;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  min-height: ${(p) => p.theme.layout.appbarHeight}rem;
  margin: 0 auto;
  padding: ${(p) => p.theme.layout.pagePaddingY}rem ${(p) => p.theme.layout.pagePaddingX}rem;
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
