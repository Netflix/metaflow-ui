import styled from 'styled-components';

//
// Placeholder text for InputWrapper elements. We can keep it more flexible this way compared to native placeholder
//

const Tip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: ${(p) => (p.visible ? '1' : '0')};
  color: #aaa;
  transition: 0.25s opacity;
  padding-left: 0.25rem;
`;

export default Tip;
