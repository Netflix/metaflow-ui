import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { ReactComponent as Timeline } from '../../assets/timeline.svg';
import { ReactComponent as ArrowDown } from '../../assets/arrow_down.svg';
import { ReactComponent as Times } from '../../assets/times.svg';
import { ReactComponent as Plus } from '../../assets/plus.svg';
import { ReactComponent as Sort } from '../../assets/sort.svg';
import { ReactComponent as Check } from '../../assets/check.svg';
import { ReactComponent as Pen } from '../../assets/pen.svg';

type SupportedIcons = {
  timeline: FunctionComponent;
  arrowDown: FunctionComponent;
  times: FunctionComponent;
  plus: FunctionComponent;
  sort: FunctionComponent;
  check: FunctionComponent;
  pen: FunctionComponent;
};

const icons: SupportedIcons = {
  timeline: Timeline,
  arrowDown: ArrowDown,
  times: Times,
  plus: Plus,
  sort: Sort,
  check: Check,
  pen: Pen,
};

type SupportedSizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  hg: number;
};

const sizeTable: SupportedSizes = {
  xs: 0.75,
  sm: 0.75,
  md: 1,
  lg: 1.5,
  hg: 2.5,
};

interface IconProps {
  name: keyof SupportedIcons;
  size?: keyof SupportedSizes;
  rotate?: number;
}

const Icon: React.FC<IconProps> = ({ name, size = 'md', rotate }) => {
  const IconComponent = icons[name];
  return (
    <Wrapper size={size} rotation={rotate}>
      <IconComponent />
    </Wrapper>
  );
};

export default Icon;

const Wrapper = styled.i<{ size: keyof SupportedSizes; rotation?: number }>`
  vertical-align: middle;
  display: inline-block;
  margin: 0;
  padding: 0;

  svg {
    height: ${(p) => sizeTable[p.size]}rem;
    width: auto;
    transform: ${(p) => (p.rotation ? `rotate(${p.rotation}deg)` : 'none')};
  }
`;
