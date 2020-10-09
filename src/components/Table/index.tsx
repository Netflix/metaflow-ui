import React from 'react';
import styled, { css } from 'styled-components';
import { SortIcon } from '../Icon';
import { parseOrderParam } from '../../utils/url';

const cell = css`
  padding: ${(p) => p.theme.spacer.xs}rem ${(p) => p.theme.spacer.md}rem;
  font-size: 0.875rem;
  text-align: left;
  border: 2px solid #fff;
`;

export default styled.table`
  width: 100%;
  margin-bottom: ${(p) => p.theme.spacer.hg}rem;
`;

export const TH = styled.th<{ active?: boolean; clickable?: boolean }>`
  background: #fff;
  color: ${(p) => p.theme.color.text.light};
  font-weight: 400;
  white-space: nowrap;
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  ${cell};

  .icon {
    color: #ccc;
  }

  &:hover {
    i {
      color: #aaa;
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

export const TD = styled.td`
  transition: background 0.15s;
  background: ${(p) => p.theme.color.bg.light};
  ${cell};

  &:hover {
    background: ${(p) => p.theme.color.bg.blueLight};
  }
`;

export const TR = styled.tr<{ clickable?: boolean }>`
  cursor: ${(p) => (p.clickable ? 'pointer' : 'auto')};
  transition: background 0.15s;
  &:hover ${TD} {
    background: ${(p) => p.theme.color.bg.blueLight};
    color: ${(p) => p.theme.color.text.blue};
  }
`;

const HeaderColumnWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface HeaderColumnProps {
  label: string;
  queryKey: string;
  currentOrder: string;
  onSort: (ord: string) => void;
}

export const HeaderColumn: React.FC<HeaderColumnProps> = ({ label, queryKey, currentOrder, onSort, ...rest }) => {
  const [direction, orderParam] = currentOrder ? parseOrderParam(currentOrder) : ['down' as const, ''];
  const active: boolean = queryKey === orderParam;

  return (
    <TH active={active} onClick={() => onSort(queryKey)} {...rest} clickable>
      <HeaderColumnWrapper>
        {label}
        <SortIcon active={active} direction={direction} padLeft />
      </HeaderColumnWrapper>
    </TH>
  );
};
