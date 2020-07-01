import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo_dark_horizontal.svg';

const AppBar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Wrapper>
      <Link to="/">
        <Logo src={logo} />
      </Link>
      <DummyBreadcrumb pathname={pathname} />
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
  pointer-events: none;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
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
