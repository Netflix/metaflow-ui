import React, { useState } from 'react';
import styled from 'styled-components';
import HeightAnimatedContainer from '../HeightAnimatedContainer';
import Icon from '../Icon';

//
// Typedef
//

type CollapsableProps = {
  title: string;
};

//
// Component
//

const Collapsable: React.FC<CollapsableProps> = ({ children, title }) => {
  const [open, setOpen] = useState(false);

  return (
    <CollapseContainer>
      <HeightAnimatedContainer>
        <CollapsableHeader onClick={() => setOpen(!open)} data-testid="collapsable-header">
          <div>{title}</div>
          <Icon name="arrowDown" rotate={open ? 180 : 0} />
        </CollapsableHeader>

        <ContentContainer>
          <Content open={open}>{children}</Content>
        </ContentContainer>
      </HeightAnimatedContainer>
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
`;

const ContentContainer = styled.div`
  position: relative;
`;

const Content = styled.div<{ open: boolean }>`
  position: ${(p) => (p.open ? 'static' : 'absolute')};
  width: 100%;
`;

export default Collapsable;
