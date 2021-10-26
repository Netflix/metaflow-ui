import React, { useEffect, useState } from 'react';
import styled, { keyframes, DefaultTheme } from 'styled-components';

const Keyframes = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const getSize = (p: {
  theme: DefaultTheme;
  size?: number;
  borderWidth?: number;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}) =>
  p.size && p.borderWidth
    ? {
        size: p.size,
        borderWidth: p.borderWidth,
      }
    : p.sm
    ? p.theme.spinner.sizes.sm
    : p.md
    ? p.theme.spinner.sizes.md
    : p.lg
    ? p.theme.spinner.sizes.lg
    : p.theme.spinner.sizes.sm;

type Props = { size?: number; borderWidth?: number; sm?: boolean; md?: boolean; lg?: boolean };

export const Spinner = styled.div<Props & { visible: boolean }>`
  display: inline-block;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;

  width: ${(p) => getSize(p).size}px;
  height: ${(p) => getSize(p).size}px;

  margin: 0;
  border-radius: 50%;
  border-style: solid;
  border-width: ${(p) => getSize(p).borderWidth}px;
  border-color: ${(p) => p.theme.spinner.color} ${(p) => p.theme.spinner.color} ${(p) => p.theme.spinner.color}
    transparent;
  animation: ${Keyframes} 1.2s linear infinite;
  transition: opacity 0.5s;
  opacity: ${(p) => (p.visible ? '1' : '0')};
`;

//
// Use timeout to smoothen up appearance of spinner
//
const SmoothSpinner: React.FC<Props> = (props) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => clearTimeout(t);
  }, []);
  return <Spinner {...props} visible={visible} />;
};

export default SmoothSpinner;
