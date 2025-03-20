import React from 'react';
import styled, { css } from 'styled-components';
import { SortIcon } from '@components/Icon';
import { darkenCssVar } from '@utils/style';
import { parseOrderParam } from '@utils/url';

export const CellStyle = css`
  padding: var(--table-cell-padding);
  font-size: var(--table-cell-font-size);
  text-align: left;
  border-top: var(--table-cell-border-top);
  border-right: var(--table-cell-border-right);
  border-bottom: var(--table-cell-border-bottom);
  border-left: var(--table-cell-border-left);
`;

export default styled.table`
  width: 100%;
  margin-bottom: var(--spacing-12);
  background: var(--table-bg);
  border: var(--table-border);
  box-shadow: var(--table-shadow);
  border-radius: var(--table-border-radius);
`;

export const THBasicStyle = css`
  background: var(--table-head-bg);
  color: var(--table-head-text-color);
  font-weight: var(--table-head-font-weight);
  white-space: nowrap;
`;

export const TH = styled.th<{ active?: boolean; clickable?: boolean }>`
  ${THBasicStyle}
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  ${CellStyle};
  padding: var(--table-head-padding);
  font-size: var(--table-head-font-size);

  .icon {
    color: ${darkenCssVar('--color-icon-light', 10)};
  }

  &:hover {
    i {
      color: ${darkenCssVar('--color-icon-light', 20)};
    }
  }

  &:first-child {
    border-top-left-radius: var(--table-border-radius);
  }

  &:last-child {
    border-top-right-radius: var(--table-border-radius);
  }

  ${(p) =>
    p.active &&
    css`
       {
        background: var(--table-head-active-bg);
        color: var(--table-head-active-text-color);
        font-weight: var(--table-head-active-font-weight);
      }
    `}
`;

export const TDBasicStyle = css`
  transition: background 0.15s;
  background: var(--table-cell-bg);
  ${CellStyle};

  color: var(--table-cell-text-color);
  font-weight: var(--table-cell-font-weight);

  &:hover {
    background: var(--table-cell-hover-bg);
  }
`;

export const TD = styled.td`
  ${TDBasicStyle}
`;

const TRHoverStyle = css`
  ${TD} {
    background: var(--table-cell-hover-bg);
    color: var(--table-cell-hover-text-color);
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

const HeaderColumnWrapper = styled.div<{ alignment: 'left' | 'right' | 'center' }>`
  display: flex;
  align-items: center;
  min-height: 1.25rem;
  justify-content: ${(p) =>
    p.alignment === 'right' ? 'flex-end' : p.alignment === 'center' ? 'center' : 'flex-start'};
`;

interface HeaderColumnProps {
  label: string;
  queryKey: string;
  currentOrder: string;
  onSort: (ord: string) => void;
  sortable: boolean;
  maxWidth?: string;
  alignment?: 'left' | 'right' | 'center';
}

export const HeaderColumn: React.FC<HeaderColumnProps> = ({
  label,
  queryKey,
  currentOrder,
  sortable = true,
  onSort,
  maxWidth,
  alignment = 'left',
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
              // width: maxWidth + (maxWidth.indexOf('%') > -1 ? '' : 'px'),
            }
          : {}
      }
    >
      <HeaderColumnWrapper alignment={alignment}>
        {label}
        {sortable && (
          <SortIconContainer>
            <SortIcon active={active} direction={direction} padLeft />
          </SortIconContainer>
        )}
      </HeaderColumnWrapper>
    </TH>
  );
};

const SortIconContainer = styled.div`
  display: inline-flex;
  margin-left: var(--spacing-1);
`;
