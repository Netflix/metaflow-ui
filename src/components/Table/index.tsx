import React from 'react';
import styled, { css } from 'styled-components';
import { SortIcon } from '../Icon';
import { parseOrderParam } from '../../utils/url';
import { darken } from 'polished';

export const CellStyle = css`
  padding: ${(p) => p.theme.spacer.sm}rem ${(p) => p.theme.spacer.md}rem;
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #fff;
`;

export default styled.table`
  width: 100%;
  margin-bottom: ${(p) => p.theme.spacer.hg}rem;
`;

export const THBasicStyle = css`
  background: ${(p) => p.theme.color.bg.white};
  color: ${(p) => p.theme.color.text.light};
  font-weight: 400;
  white-space: nowrap;
`;

export const TH = styled.th<{ active?: boolean; clickable?: boolean }>`
  ${THBasicStyle}
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  ${CellStyle};

  .icon {
    color: ${(p) => darken(0.1, p.theme.color.icon.light)};
  }

  &:hover {
    i {
      color: ${(p) => darken(0.2, p.theme.color.icon.light)};
    }
  }

  ${(p) =>
    p.active &&
    css`
       {
        color: ${(p) => p.theme.color.text.dark};
        font-weight: 500;
      }
    `}
`;

export const TDBasicStyle = css`
  transition: background 0.15s;
  background: ${(p) => p.theme.color.bg.light};
  ${CellStyle};

  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

export const TD = styled.td`
  ${TDBasicStyle}
`;

const TRHoverStyle = css`
  ${TD} {
    background: ${(p) => p.theme.color.bg.blueLight};
    color: ${(p) => p.theme.color.text.blue};
  }
`;

export const TR = styled.tr<{ clickable?: boolean; stale?: boolean; active?: boolean }>`
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  transition: background 0.15s, opacity 0.15s;
  &:hover {
    ${TRHoverStyle}
  }
  ${(p) => (p.active ? TRHoverStyle : '')}

  ${(p) =>
    p.stale
      ? css`
          td {
            opacity: 0.6;
          }
        `
      : ''}
`;

const HeaderColumnWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 1.25rem;
`;

interface HeaderColumnProps {
  label: string;
  queryKey: string;
  currentOrder: string;
  onSort: (ord: string) => void;
  sortable: boolean;
  maxWidth?: string;
}

export const HeaderColumn: React.FC<HeaderColumnProps> = ({
  label,
  queryKey,
  currentOrder,
  sortable = true,
  onSort,
  maxWidth,
  ...rest
}) => {
  const [direction, orderParam] = currentOrder ? parseOrderParam(currentOrder) : ['down' as const, ''];
  const active: boolean = queryKey === orderParam;

  return (
    <TH
      active={active}
      onClick={() => (sortable ? onSort(queryKey) : null)}
      {...rest}
      clickable={sortable}
      style={
        maxWidth
          ? {
              maxWidth: maxWidth + (maxWidth.indexOf('%') > -1 ? '' : 'px'),
              width: maxWidth + (maxWidth.indexOf('%') > -1 ? '' : 'px'),
            }
          : {}
      }
    >
      <HeaderColumnWrapper>
        {label}
        {sortable && <SortIcon active={active} direction={direction} padLeft />}
      </HeaderColumnWrapper>
    </TH>
  );
};
