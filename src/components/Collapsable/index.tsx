import React, { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import HeightAnimatedContainer from '../HeightAnimatedContainer';
import Icon from '../Icon';

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
  margin: 0.5rem 0 1rem 0;
`;

const CollapsableHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: var(--font-size-primary);
  font-weight: 500;
  line-height: 1.5rem;
  border-bottom: var(--border-thin-1);
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
