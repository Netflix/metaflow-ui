import React from 'react';
import styled from 'styled-components';
import { CheckboxField } from '@components/Form/Checkbox';
import Icon from '@components/Icon';

export const FilterOptionRow: React.FC<{ onClick: () => void; selected: boolean; children: React.ReactNode }> = ({
  children,
  selected = false,
  onClick,
}) => (
  <FilterClickableRow onClick={onClick}>
    <CheckboxField checked={selected} />
    {children}
  </FilterClickableRow>
);

export const FilterClickableRow = styled.div<{ disabled?: boolean; danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  border-radius: var(--radius-primary);
  padding: 0.375rem 0.5rem;
  cursor: pointer;

  opacity: ${(p) => (p.disabled ? 0.2 : 1)};
  color: ${(p) => (p.danger ? 'var(--color-text-danger)' : 'var(--color-text-primary)')};

  white-space: normal;

  &:hover {
    background: var(--color-bg-secondary);
  }
`;

type ClearFilterRowProps = {
  onClick: () => void;
  disabled: boolean;
};
export const ClearFilterRow: React.FC<ClearFilterRowProps> = ({ onClick, disabled }) => (
  <FilterClickableRow onClick={onClick} danger disabled={disabled}>
    <Icon name="trash" /> Clear filter
  </FilterClickableRow>
);

export const FilterSeparator = styled.div`
  border-top: var(--border-thin-1);
  margin: 0.5rem 0;
`;

export const FilterPopupTrailing: React.FC<{ clear?: ClearFilterRowProps; children?: React.ReactNode }> = ({
  children,
  clear,
}) => (
  <div>
    <FilterSeparator />
    {clear && <ClearFilterRow {...clear} />}
    {children}
  </div>
);
