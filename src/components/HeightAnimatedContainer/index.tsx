import React, { useRef } from 'react';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';

//
// Component
//

const HeightAnimatedContainer: React.FC = ({ children }) => {
  const _innerElement = useRef<HTMLDivElement>(null);
  const { height } = useComponentSize(_innerElement);

  return (
    <OuterContainer maxHeight={height}>
      <InnerContainer ref={_innerElement}>{children}</InnerContainer>
    </OuterContainer>
  );
};

//
// Style
//

const OuterContainer = styled.div<{ maxHeight: number }>`
  overflow: hidden;

  height: ${(p) => p.maxHeight}px;
  transition: height 0.25s;
`;
const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default HeightAnimatedContainer;
