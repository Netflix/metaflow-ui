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
        {!FEATURE_FLAGS.HIDE_CONNECTION_STATUS && <ConnectionStatus />}
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
  background: var(--color-bg-primary);
  z-index: 999;
  flex-direction: column;
`;

const Logo = styled.img`
  height: var(--layout-application-bar-logo-height);
`;

const LogoLink = styled(Link)`
  margin-right: 1.7rem;
`;
