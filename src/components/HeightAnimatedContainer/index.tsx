import React, { useRef } from 'react';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';

//
// Container that is automatically updating its height with animations.
//

const HeightAnimatedContainer: React.FC<{ active?: boolean }> = ({ children, active = true }) => {
  const _innerElement = useRef<HTMLDivElement>(null);
  const { height } = useComponentSize(_innerElement);

  return (
    <OuterContainer style={!active ? undefined : { height: height + 'px' }}>
      <InnerContainer ref={_innerElement}>{children}</InnerContainer>
    </OuterContainer>
  );
};

//
// Style
//

const OuterContainer = styled.div`
  overflow: hidden;
  position: relative;
  transition: height 0.25s;
  transform: translate3d(0, 0, 0);
`;
const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default HeightAnimatedContainer;
