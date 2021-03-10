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
        <CollapsableHeader onClick={() => setOpen(!open)}>
          <div>{title}</div>
          <Icon name="arrowDown" rotate={open ? 180 : 0} />
        </CollapsableHeader>
        {open && children}
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

export default Collapsable;
