import styled, { keyframes } from 'styled-components';

const Keyframes = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

//const Spinner = styled.div`
const Spinner = styled.div<{ size?: number; borderWidth?: number }>`
  display: inline-block;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  width: ${(p) => p.size || p.theme.spinner.size}px;
  height: ${(p) => p.size || p.theme.spinner.size}px;
  margin: 0;
  border-radius: 50%;
  border-style: solid;
  border: 2px solid red;
  border-width: ${(p) => p.borderWidth || p.theme.spinner.borderWidth}px;
  border-color: ${(p) => p.theme.spinner.color} ${(p) => p.theme.spinner.color} ${(p) => p.theme.spinner.color}
    transparent;
  animation: ${Keyframes} 1.2s linear infinite;
`;

export default Spinner;
