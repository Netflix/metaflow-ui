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
  xs: 0.875,
  sm: 1,
  md: 1.5,
  lg: 2,
  hg: 2.5,
};

interface IconProps {
  name: keyof SupportedIcons;
  size?: keyof SupportedSizes;
  rotate?: number;
  className?: string;
  padLeft?: boolean;
  padRight?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, size = 'md', rotate, ...rest }) => {
  const IconComponent = icons[name];
  return (
    <Wrapper className={`icon icon-${name}`} {...rest} {...{ size, rotate }}>
      <IconComponent />
    </Wrapper>
  );
};

export default Icon;

const Wrapper = styled.i<{ size: keyof SupportedSizes; rotate?: number; padLeft?: boolean; padRight?: boolean }>`
  vertical-align: text-top;
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0;
  padding-left: ${(p) => (p.padLeft ? p.theme.spacer.sm : 0)}rem;
  padding-right: ${(p) => (p.padRight ? p.theme.spacer.sm : 0)}rem;

  svg {
    height: ${(p) => sizeTable[p.size]}rem;
    width: auto;
    transform: ${(p) => (p.rotate ? `rotate(${p.rotate}deg)` : 'none')};
  }
`;

type SortIconProps = Omit<IconProps, 'name'> & { direction: 'up' | 'down'; active?: boolean };

export const SortIcon: React.FC<SortIconProps> = ({ direction, ...rest }) => (
  <StyledSortIcon direction={direction} name="sort" className="icon icon-sort" {...rest} />
);

const StyledSortIcon = styled(Icon)<SortIconProps>`
  color: ${(p) => p.theme.color.icon.light};

  #up {
    color: ${(p) => (p.active && p.direction === 'up' ? p.theme.color.icon.dark : 'currentColor')};
  }

  #down {
    color: ${(p) => (p.active && p.direction === 'down' ? p.theme.color.icon.dark : 'currentColor')};
  }
`;
