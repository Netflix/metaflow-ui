import React, { useRef } from 'react';
import styled from 'styled-components';
import logo from '../../assets/logo_dark_horizontal.svg';
import Icon from '../Icon';
import useComponentSize from '@rehooks/component-size';

//
// Typedef
//

type FullPageContainerProps = {
  onClose: () => void;
  // Function that returns component. Gets available height as parameter
  component?: (height: number) => JSX.Element;
};

//
// Component
//

const FullPageContainer: React.FC<FullPageContainerProps> = ({ children, onClose, component }) => {
  const _content = useRef<HTMLDivElement>(null);
  const ContentSize = useComponentSize(_content);
  return (
    <FullPageStyleContainer>
      <FullPageContainerHeader>
        <Logo src={logo} />

        <FullPageContainerClose data-testid="fullpage-close-button" onClick={() => onClose()}>
          <Icon name="times" size="lg" />
        </FullPageContainerClose>
      </FullPageContainerHeader>

      <FullPageContainerContent ref={_content} data-testid="fullpage-content">
        {component ? component(ContentSize.height) : children}
      </FullPageContainerContent>
    </FullPageStyleContainer>
  );
};

//
// Styles
//

const FullPageStyleContainer = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 9999;
  background: ${(p) => p.theme.color.bg.white};

  display: flex;
  flex-direction: column;
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
  flex: 1 1 0;
  overflow: hidden;
`;

const FullPageContainerClose = styled.div`
  cursor: pointer;
`;

const Logo = styled.img`
  height: ${(p) => p.theme.layout.appbarLogoHeight}rem;
`;

export default FullPageContainer;
