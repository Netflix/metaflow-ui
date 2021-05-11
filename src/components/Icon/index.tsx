import React, { FunctionComponent } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { ReactComponent as Timeline } from '../../assets/timeline.svg';
import { ReactComponent as ArrowDown } from '../../assets/arrow_down.svg';
import { ReactComponent as Times } from '../../assets/times.svg';
import { ReactComponent as Plus } from '../../assets/plus.svg';
import { ReactComponent as Minus } from '../../assets/minus.svg';
import { ReactComponent as Sort } from '../../assets/sort.svg';
import { ReactComponent as Check } from '../../assets/check.svg';
import { ReactComponent as Pen } from '../../assets/pen.svg';
import { ReactComponent as Search } from '../../assets/search.svg';
import { ReactComponent as Ellipsis } from '../../assets/ellipsis.svg';
import { ReactComponent as Return } from '../../assets/return.svg';
import { ReactComponent as Maximize } from '../../assets/maximize.svg';
import { ReactComponent as Collapse } from '../../assets/collapse.svg';
import { ReactComponent as Expand } from '../../assets/expand.svg';
import { ReactComponent as Listing } from '../../assets/listing.svg';
import { ReactComponent as Enter } from '../../assets/enter.svg';
import { ReactComponent as QuestionCircled } from '../../assets/question-circled.svg';
import { ReactComponent as ListItemNotFound } from '../../assets/list-item-not-found.svg';
import { ReactComponent as ListNotFound } from '../../assets/list-not-found.svg';
import { ReactComponent as NoDag } from '../../assets/no-dag.svg';
import { ReactComponent as NoData } from '../../assets/no-data.svg';
import { ReactComponent as SearchNotFound } from '../../assets/search-not-found.svg';
import { ReactComponent as Danger } from '../../assets/danger.svg';
import { ReactComponent as Success } from '../../assets/success.svg';
import { ReactComponent as Info } from '../../assets/info.svg';
import { ReactComponent as InfoSmall } from '../../assets/info-small.svg';
import { ReactComponent as InfoThick } from '../../assets/info_thick.svg';
import { ReactComponent as Warning } from '../../assets/warning.svg';
import { ReactComponent as WarningThick } from '../../assets/warning_thick.svg';
import { ReactComponent as External } from '../../assets/external.svg';
import { ReactComponent as Copy } from '../../assets/copy.svg';
import { ReactComponent as Download } from '../../assets/download.svg';
import { ReactComponent as ToTopArrow } from '../../assets/to_top_arrow.svg';
import { ReactComponent as ArrowPointTop } from '../../assets/arrow-point-up.svg';
import { ReactComponent as RowLoader } from '../../assets/row-loader.svg';
import { ReactComponent as Plugin } from '../../assets/plugin.svg';

export type SupportedIcons = {
  timeline: FunctionComponent;
  arrowDown: FunctionComponent;
  times: FunctionComponent;
  plus: FunctionComponent;
  minus: FunctionComponent;
  sort: FunctionComponent;
  check: FunctionComponent;
  pen: FunctionComponent;
  search: FunctionComponent;
  ellipsis: FunctionComponent;
  return: FunctionComponent;
  maximize: FunctionComponent;
  collapse: FunctionComponent;
  expand: FunctionComponent;
  listing: FunctionComponent;
  enter: FunctionComponent;
  questionCircled: FunctionComponent;
  listItemNotFound: FunctionComponent;
  listNotFound: FunctionComponent;
  noDag: FunctionComponent;
  noData: FunctionComponent;
  searchNotFound: FunctionComponent;
  danger: FunctionComponent;
  success: FunctionComponent;
  info: FunctionComponent;
  infoSmall: FunctionComponent;
  infoThick: FunctionComponent;
  warning: FunctionComponent;
  warningThick: FunctionComponent;
  external: FunctionComponent;
  copy: FunctionComponent;
  download: FunctionComponent;
  toTopArrow: FunctionComponent;
  arrowPointTop: FunctionComponent;
  rowLoader: FunctionComponent;
  plugin: FunctionComponent;
};

const icons: SupportedIcons = {
  timeline: Timeline,
  arrowDown: ArrowDown,
  times: Times,
  plus: Plus,
  minus: Minus,
  sort: Sort,
  check: Check,
  pen: Pen,
  search: Search,
  ellipsis: Ellipsis,
  return: Return,
  maximize: Maximize,
  collapse: Collapse,
  expand: Expand,
  listing: Listing,
  enter: Enter,
  questionCircled: QuestionCircled,
  listItemNotFound: ListItemNotFound,
  listNotFound: ListNotFound,
  noDag: NoDag,
  noData: NoData,
  searchNotFound: SearchNotFound,
  danger: Danger,
  success: Success,
  info: Info,
  infoSmall: InfoSmall,
  infoThick: InfoThick,
  warning: Warning,
  warningThick: WarningThick,
  external: External,
  copy: Copy,
  download: Download,
  toTopArrow: ToTopArrow,
  arrowPointTop: ArrowPointTop,
  rowLoader: RowLoader,
  plugin: Plugin,
};

export type IconKeys = keyof SupportedIcons;

type SupportedSizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  hg: number;
};

export type IconSizes = keyof SupportedSizes;

const sizeTable: SupportedSizes = {
  xs: 0.75,
  sm: 1,
  md: 1.5,
  lg: 2,
  hg: 2.5,
};
interface IconProps {
  name: keyof SupportedIcons;
  size?: keyof SupportedSizes;
  customSize?: number;
  rotate?: number;
  className?: string;
  padLeft?: boolean;
  padRight?: boolean;
  spin?: boolean;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ name, size = 'sm', rotate, ...rest }) => {
  const IconComponent = icons[name];
  return (
    <Wrapper className={`icon icon-${name}`} {...rest} {...{ size, rotate }}>
      <IconComponent />
    </Wrapper>
  );
};

export default Icon;

const Wrapper = styled.i<{
  size: keyof SupportedSizes;
  customSize?: number;
  rotate?: number;
  spin?: boolean;
  padLeft?: boolean;
  padRight?: boolean;
}>`
  vertical-align: text-top;
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0;
  padding-left: ${(p) => (p.padLeft ? p.theme.spacer.sm : 0)}rem;
  padding-right: ${(p) => (p.padRight ? p.theme.spacer.sm : 0)}rem;

  ${(p) =>
    p.spin
      ? css`
          animation: ${SpinKeyframes} 1.2s linear infinite;
        `
      : null}

  svg {
    height: ${(p) => p.customSize || sizeTable[p.size]}rem;
    transform: ${(p) => (p.rotate ? `rotate(${p.rotate}deg)` : 'none')};
    width: auto;
  }
  svg path {
    fill: currentColor;
  }
`;

const SpinKeyframes = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
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
