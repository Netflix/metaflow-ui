import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';
import Breadcrumb from '../Breadcrumb';
import { ItemRow } from '../Structure';

const AppBar: React.FC = () => {
  return (
    <Wrapper>
      <ItemRow pad="lg">
        <Link to="/">
          <Logo src={logo} />
        </Link>
        <Breadcrumb />
      </ItemRow>
    </Wrapper>
  );
};

export default AppBar;

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${(p) => p.theme.layout.appbarHeight}rem;
  padding: 0 ${(p) => p.theme.layout.pagePaddingX}rem;
  background: rgba(255, 255, 255, 0.75);
  z-index: 1;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
`;
