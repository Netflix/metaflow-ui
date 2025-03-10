import React, { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import HeightAnimatedContainer from '@components/HeightAnimatedContainer';
import Icon from '@components/Icon';

//
// Typedef
//

type CollapsableProps = {
  title: string | JSX.Element;
  animated?: boolean;
  initialState?: boolean;
  children: ReactNode;
};

//
// Component
//

const Collapsable: React.FC<CollapsableProps> = ({ children, title, animated = true, initialState = false }) => {
  const [open, setOpen] = useState(initialState);
  const [transitioning, setTransitioning] = useState(false);
  const Container: React.FC<{ children: ReactNode; active?: boolean | undefined }> = animated
    ? HeightAnimatedContainer
    : ({ children: c }) => <>{c}</>;

  // Only keep animator active while user clicked buttons. Other wise we could have problems with performance on
  // nested collapse elements
  useEffect(() => {
    const t = setTimeout(() => {
      setTransitioning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <CollapseContainer>
      <Container active={transitioning}>
        <CollapsableHeader
          open={open}
          onClick={() => {
            setTransitioning(true);
            setOpen(!open);
          }}
          data-testid="collapsable-header"
        >
          <Icon name="arrowDown" rotate={open ? 0 : -90} />
          <Title>{title}</Title>
        </CollapsableHeader>

        {(animated || open) && (
          <ContentContainer data-testid="collapsable-content">
            <Content open={open} visible={open || transitioning}>
              {children}
            </Content>
          </ContentContainer>
        )}
      </Container>
    </CollapseContainer>
  );
};

//
// Style
//

const CollapseContainer = styled.div`
  margin: var(--collapsable-margin);
  border-bottom: var(--collapsable-content-border-bottom);
`;

const CollapsableHeader = styled.div<{ open: boolean }>`
  display: flex;
  justify-content: flex-start;
  font-family: var(--collapsable-header-font-family);
  font-size: var(--font-size-primary);
  font-weight: 500;
  color: ${(p) => (p.open ? 'var(--collapsable-header-open-text-color)' : 'var(--collapsable-header-text-color)')};
  line-height: 1.5rem;
  padding: var(--collapsable-header-padding);
  border-bottom: var(--collapsable-header-border-bottom);
  cursor: pointer;

  svg path {
    fill: transparent;
  }
`;

const ContentContainer = styled.div`
  position: relative;
`;

const Content = styled.div<{ open: boolean; visible: boolean }>`
  position: ${(p) => (p.open ? 'static' : 'absolute')};
  width: 100%;
  visibility: ${(p) => (p.visible ? 'visible' : 'hidden')};
`;

const Title = styled.div`
  margin-right: 1rem;
  margin-left: 0.3rem;
`;

export default Collapsable;
