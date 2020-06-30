import React from 'react';
import styled, { css } from 'styled-components';
import { lighten } from 'polished';
import Icon from '../Icon';

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

export const TH = styled.th<{active?: boolean}>`
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

  ${p => p.active && css`{
    color: ${(p) => p.theme.color.text.dark};
    font-weight: 500;

    &.up i #up {
      color: ${(p) => p.theme.color.text.dark};
    }

    &.down i #down {
      color: ${(p) => p.theme.color.text.dark};
    }
  }`}
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

export const HeaderColumn: React.FC<HeaderColumnProps> = ({ label, queryKey, currentOrder: co, onSort, ...rest }) => {
  const [currentKey, currentDirection] = [co.substr(1), co.substr(0, 1)];
  const active: boolean = queryKey === currentKey;
  const dirClass = !active ? '' : currentDirection === '+' ? 'down' : 'up';

  return (
    <TH active={active} className={dirClass} onClick={() => onSort(queryKey)} {...rest}>
      {label}
      <Icon name="sort" />
    </TH>
  );
};
