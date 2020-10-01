import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';
import Breadcrumb from '../Breadcrumb';
import { ItemRow } from '../Structure';
import HelpMenu from '../HelpMenu';

const AppBar: React.FC = () => {
  return (
    <Wrapper>
      <ItemRow pad="lg">
        <Link to="/">
          <Logo src={logo} />
        </Link>
        <Breadcrumb />
        <HelpMenu />
      </ItemRow>
    </Wrapper>
  );
};

export default AppBar;

const Wrapper = styled.header`
  max-width: ${(p) => p.theme.layout.maxWidth}px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${(p) => p.theme.layout.appbarHeight}rem;
  margin: 0 auto;
  padding: 0 ${(p) => p.theme.layout.pagePaddingX}rem;
  background: #fff;
  z-index: 999;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
`;
