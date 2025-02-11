import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import logo from '../../assets/logo_dark_horizontal.svg';
import Icon from '../Icon';
import useComponentSize from '@rehooks/component-size';
import useOnKeyPress from '../../hooks/useOnKeyPress';
import FEATURE_FLAGS from '../../utils/FEATURE';

//
// Typedef
//

type FullPageContainerProps = {
  title?: string;
  onClose: () => void;
  // Function that returns component. Gets available height as parameter
  component?: (height: number) => JSX.Element;
  actionbar?: React.ReactNode;
  children?: React.ReactNode;
};

//
// Component for showing content full screen. Useful for part we want to give more space on demand.
//

const FullPageContainer: React.FC<FullPageContainerProps> = ({ children, onClose, component, title, actionbar }) => {
  const _content = useRef<HTMLDivElement>(null);
  const ContentSize = useComponentSize(_content);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const onCloseEvent = () => {
    document.body.style.overflow = 'inherit';
    onClose();
  };

  useOnKeyPress('Escape', onCloseEvent);

  return (
    <FullPageStyleContainer>
      <FullPageContainerHeader>
        <HeaderSection>
          {!FEATURE_FLAGS.HIDE_LOGO && <Logo src={logo} />}
          {title && <HeaderTitle>{title}</HeaderTitle>}
        </HeaderSection>

        <HeaderSection>
          {actionbar && actionbar}
          <FullPageContainerClose data-testid="fullpage-close-button" onClick={onCloseEvent}>
            <Icon name="times" size="lg" />
          </FullPageContainerClose>
        </HeaderSection>
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
  background: var(--color-bg-primary);

  display: flex;
  flex-direction: column;
`;

const FullPageContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-size: 1.125rem;
  margin-left: 1.5rem;
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
  margin-left: 1.5rem;
`;

const Logo = styled.img`
  height: var(--layout-application-bar-logo-height);
`;

export default FullPageContainer;
