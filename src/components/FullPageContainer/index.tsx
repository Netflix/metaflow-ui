import React from 'react';
import styled from 'styled-components';
import logo from '../../assets/logo_dark_horizontal.svg';
import Icon from '../Icon';

type FullPageContainerProps = {
  onClose: () => void;
};

const FullPageContainer: React.FC<FullPageContainerProps> = ({ children, onClose }) => {
  return (
    <FullPageStyleContainer>
      <FullPageContainerHeader>
        <Logo src={logo} />

        <FullPageContainerClose onClick={() => onClose()}>
          <Icon name="times" size="lg" />
        </FullPageContainerClose>
      </FullPageContainerHeader>
      <FullPageContainerContent>{children}</FullPageContainerContent>
    </FullPageStyleContainer>
  );
};

const FullPageStyleContainer = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 9999;
  background: #fff;
`;

const FullPageContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem;
`;

const FullPageContainerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FullPageContainerClose = styled.div`
  cursor: pointer;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
`;

export default FullPageContainer;
