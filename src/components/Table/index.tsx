import React from 'react';
import styled, { css } from 'styled-components';
import { SortIcon } from '../Icon';
import { parseOrderParam } from '../../utils/url';
import { darkenCssVar } from '../../utils/style';

export const CellStyle = css`
  padding: var(--spacing-3) var(--spacing-7);
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #fff;
`;

export default styled.table`
  width: 100%;
  margin-bottom: var(--spacing-12);
`;

export const THBasicStyle = css`
  background: var(--color-bg-primary);
  color: var(--color-text-light);
  font-weight: 400;
  white-space: nowrap;
`;

export const TH = styled.th<{ active?: boolean; clickable?: boolean }>`
  ${THBasicStyle}
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  ${CellStyle};

  .icon {
    color: ${darkenCssVar('--color-icon-light', 10)};
  }

  &:hover {
    i {
      color: ${darkenCssVar('--color-icon-light', 20)};
    }
  }

  ${(p) =>
    p.active &&
    css`
       {
        color: var(--color-text-primary);
        font-weight: 500;
      }
    `}
`;

export const TDBasicStyle = css`
  transition: background 0.15s;
  background: var(--color-bg-secondary);
  ${CellStyle};

  &:hover {
    background: var(--color-bg-secondary-highlight);
  }
`;

export const TD = styled.td`
  ${TDBasicStyle}
`;

const TRHoverStyle = css`
  ${TD} {
    background: var(--color-bg-secondary-highlight);
    color: var(--color-text-highlight);
  }
`;

export const TR = styled.tr<{ clickable?: boolean; stale?: boolean; active?: boolean }>`
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  transition:
    background 0.15s,
    opacity 0.15s;
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
