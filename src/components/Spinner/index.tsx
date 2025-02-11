import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const Keyframes = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const getSize = (p: { sm?: boolean; md?: boolean; lg?: boolean }) =>
  p.sm ? 'sm' : p.md ? 'md' : p.lg ? 'lg' : 'default';
const getSizeValue = (p: { sm?: boolean; md?: boolean; lg?: boolean }) => `var(--spinner-${getSize(p)}-size)`;
const getBorderValue = (p: { sm?: boolean; md?: boolean; lg?: boolean }) => `var(--spinner-${getSize(p)}-border-width)`;

type Props = { size?: number; borderWidth?: number; sm?: boolean; md?: boolean; lg?: boolean };

export const Spinner = styled.div<Props & { visible: boolean }>`
  display: inline-block;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;

  width: ${(p) => (p.size ? p.size + 'px' : getSizeValue(p))};
  height: ${(p) => (p.size ? p.size + 'px' : getSizeValue(p))};

  margin: 0;
  border-radius: 50%;
  border-style: solid;
  border-width: ${(p) => (p.borderWidth ? p.borderWidth + 'px' : getBorderValue(p))};
  border-color: var(--spinner-color) var(--spinner-color) var(--spinner-color) transparent;
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
