import React, { useEffect, useState } from 'react';
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
};

//
// Component
//

const Collapsable: React.FC<CollapsableProps> = ({ children, title, animated = true, initialState = false }) => {
  const [open, setOpen] = useState(initialState);
  const [transitioning, setTransitioning] = useState(false);
  const Container: React.FC<{ active?: boolean | undefined }> = animated
    ? HeightAnimatedContainer
    : ({ children: c }) => <>{c}</>;

  // Only keep animator active while user clicked buttons. Other wise we could have problems with performance on
  // nested collapse elements
  useEffect(() => {
    const t: number | undefined = undefined;
    setTimeout(() => {
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
          <div>{title}</div>
          <Icon name="arrowDown" rotate={open ? 180 : 0} />
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
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5rem;
  border-bottom: ${(p) => p.theme.border.thinLight};
  cursor: pointer;

  svg path {
    fill: #fff;
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

export default Collapsable;
