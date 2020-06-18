import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';
import { layout } from '../../utils/theme';

interface AppBar {} // eslint-disable-line

// eslint-disable-next-line
export default function AppBar({}: AppBar) {
  const { pathname } = useLocation();

  return (
    <Wrapper>
      <Link to="/">
        <Logo src={logo} />
      </Link>
      <DummyBreadcrumb pathname={pathname} />
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${layout('appbarHeight')}rem;
  padding: 0 ${layout('pagePaddingX')}rem;
  background: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.1) 0 1px 0px;
`;

const Logo = styled.img`
  height: ${layout('appbarLogoHeight')}rem;
`;

const DummyBreadcrumb: React.FC<{ pathname: string }> = ({ pathname }) => {
  const patharray = pathname.split('/');

  return (
    <Breadcrumb>
      {pathname !== '/' &&
        patharray.map((path, index) => (
          <span key={index} style={{ display: 'flex' }}>
            <Link to={patharray.slice(0, index).join('/') + '/' + path}>
              <BreadcrumbItem>{path}</BreadcrumbItem>
            </Link>
            {index !== 0 && index + 1 !== patharray.length && <span>/</span>}
          </span>
        ))}
    </Breadcrumb>
  );
};

const Breadcrumb = styled.div`
  display: flex;
  padding: 0 15px;
`;

const BreadcrumbItem = styled.div`
  color: #000;
  padding: 0 5px;
`;
