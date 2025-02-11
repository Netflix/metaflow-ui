import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as ArrowDown } from '../../assets/arrow_down.svg';
import { ReactComponent as ArrowPointTop } from '../../assets/arrow-point-up.svg';
import { ReactComponent as Calendar } from '../../assets/calendar.svg';
import { ReactComponent as CaretDown } from '../../assets/caret_down.svg';
import { ReactComponent as Check } from '../../assets/check.svg';
import { ReactComponent as Chevron } from '../../assets/chevron.svg';
import { ReactComponent as Collapse } from '../../assets/collapse.svg';
import { ReactComponent as Completed } from '../../assets/completed.svg';
import { ReactComponent as Copy } from '../../assets/copy.svg';
import { ReactComponent as Danger } from '../../assets/danger.svg';
import { ReactComponent as Download } from '../../assets/download.svg';
import { ReactComponent as Ellipsis } from '../../assets/ellipsis.svg';
import { ReactComponent as Enter } from '../../assets/enter.svg';
import { ReactComponent as Error } from '../../assets/error.svg';
import { ReactComponent as Expand } from '../../assets/expand.svg';
import { ReactComponent as External } from '../../assets/external.svg';
import { ReactComponent as Info } from '../../assets/info.svg';
import { ReactComponent as InfoSmall } from '../../assets/info-small.svg';
import { ReactComponent as InfoThick } from '../../assets/info_thick.svg';
import { ReactComponent as Link } from '../../assets/link.svg';
import { ReactComponent as Listing } from '../../assets/listing.svg';
import { ReactComponent as ListItemNotFound } from '../../assets/list-item-not-found.svg';
import { ReactComponent as ListNotFound } from '../../assets/list-not-found.svg';
import { ReactComponent as Maximize } from '../../assets/maximize.svg';
import { ReactComponent as Minus } from '../../assets/minus.svg';
import { ReactComponent as NoDag } from '../../assets/no-dag.svg';
import { ReactComponent as NoData } from '../../assets/no-data.svg';
import { ReactComponent as Pen } from '../../assets/pen.svg';
import { ReactComponent as Pending } from '../../assets/pending.svg';
import { ReactComponent as Plugin } from '../../assets/plugin.svg';
import { ReactComponent as Plus } from '../../assets/plus.svg';
import { ReactComponent as QuestionCircled } from '../../assets/question-circled.svg';
import { ReactComponent as Return } from '../../assets/return.svg';
import { ReactComponent as RowLoader } from '../../assets/row-loader.svg';
import { ReactComponent as Running } from '../../assets/running.svg';
import { ReactComponent as Search } from '../../assets/search.svg';
import { ReactComponent as SearchNotFound } from '../../assets/search-not-found.svg';
import { ReactComponent as Sort } from '../../assets/sort.svg';
import { ReactComponent as Success } from '../../assets/success.svg';
import { ReactComponent as Timeline } from '../../assets/timeline.svg';
import { ReactComponent as Times } from '../../assets/times.svg';
import { ReactComponent as ToTopArrow } from '../../assets/to_top_arrow.svg';
import { ReactComponent as Warning } from '../../assets/warning.svg';
import { ReactComponent as WarningThick } from '../../assets/warning_thick.svg';

const icons = {
  arrow: Arrow,
  arrowDown: ArrowDown,
  arrowPointTop: ArrowPointTop,
  calendar: Calendar,
  caretDown: CaretDown,
  check: Check,
  chevron: Chevron,
  collapse: Collapse,
  completed: Completed,
  copy: Copy,
  danger: Danger,
  download: Download,
  ellipsis: Ellipsis,
  enter: Enter,
  error: Error,
  expand: Expand,
  external: External,
  info: Info,
  infoSmall: InfoSmall,
  infoThick: InfoThick,
  link: Link,
  listing: Listing,
  listItemNotFound: ListItemNotFound,
  listNotFound: ListNotFound,
  maximize: Maximize,
  minus: Minus,
  noDag: NoDag,
  noData: NoData,
  pen: Pen,
  pending: Pending,
  plugin: Plugin,
  plus: Plus,
  questionCircled: QuestionCircled,
  return: Return,
  rowLoader: RowLoader,
  running: Running,
  search: Search,
  searchNotFound: SearchNotFound,
  sort: Sort,
  success: Success,
  timeline: Timeline,
  times: Times,
  toTopArrow: ToTopArrow,
  warning: Warning,
  warningThick: WarningThick,
};

export type SupportedIcons = typeof icons;

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
  customSize?: string;
  rotate?: number;
  className?: string;
  padLeft?: boolean;
  padRight?: boolean;
  spin?: boolean;
  title?: string;
  visible?: boolean;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ name, size = 'sm', visible = true, rotate, ...rest }) => {
  const IconComponent = icons[name];
  return (
    <Wrapper className={`icon icon-${name}`} {...rest} {...{ size, visible, rotate }}>
      <IconComponent />
    </Wrapper>
  );
};

export default Icon;

const Wrapper = styled.i<{
  size: keyof SupportedSizes;
  customSize?: string;
  rotate?: number;
  spin?: boolean;
  padLeft?: boolean;
  padRight?: boolean;
  title?: string;
  visible?: boolean;
}>`
  vertical-align: text-top;
  display: ${(p) => (p.visible ? 'inline-flex' : 'none')};
  align-items: center;
  margin: 0;
  padding: 0;
  padding-left: ${(p) => (p.padLeft ? 'var(--spacing-3)' : 0)}rem;
  padding-right: ${(p) => (p.padRight ? 'var(--spacing-3)' : 0)}rem;

  ${(p) =>
    p.spin
      ? css`
          animation: ${SpinKeyframes} 1.2s linear infinite;
        `
      : null}

  svg {
    height: ${(p) => p.customSize || sizeTable[p.size] + 'rem'};
    transform: ${(p) => (p.rotate ? `rotate(${p.rotate}deg)` : 'none')};
    transition: transform 0.25s;
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
  color: var(--color-icon-light);

  #up {
    color: ${(p) => (p.active && p.direction === 'up' ? 'var(--color-icon-primary)' : 'currentColor')};
  }

  #down {
    color: ${(p) => (p.active && p.direction === 'down' ? 'var(--color-icon-primary)' : 'currentColor')};
  }
`;
