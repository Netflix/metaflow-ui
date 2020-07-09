import React from 'react';
import styled, { css } from 'styled-components';
import { lighten } from 'polished';
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

export const TH = styled.th<{ active?: boolean }>`
  background: #fff;
  color: ${(p) => p.theme.color.text.light};
  font-weight: 400;
  cursor: pointer;
  white-space: nowrap;
  ${cell};

  i {
    color: #ccc;
    margin-left: ${(p) => p.theme.spacer.xs}rem;
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
  background: ${(p) => p.theme.color.bg.light};
  ${cell};

  &:hover {
    background: ${(p) => lighten(0.02, p.theme.color.bg.blueLight)};
  }
`;

export const TR = styled.tr`
  cursor: pointer;

  &:hover ${TD} {
    background: ${(p) => p.theme.color.bg.blueLight};
    color: ${(p) => p.theme.color.text.blue};
  }
`;

interface HeaderColumnProps {
  label: string;
  queryKey: string;
  currentOrder: string;
  onSort: (ord: string) => void;
}

export const HeaderColumn: React.FC<HeaderColumnProps> = ({ label, queryKey, currentOrder, onSort, ...rest }) => {
  const [direction, orderParam] = parseOrderParam(currentOrder);
  const active: boolean = queryKey === orderParam;

  return (
    <TH active={active} onClick={() => onSort(queryKey)} {...rest}>
      {label}
      <SortIcon active={active} direction={direction} />
    </TH>
  );
};
