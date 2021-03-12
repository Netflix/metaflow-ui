import React from 'react';
import styled from 'styled-components';

type PropertyTableScheme = 'dark' | 'bright' | 'normal';

export type PropertyTableColumns<T> = {
  label: React.ReactNode;
  prop?: keyof T;
  accessor?: (item: T) => React.ReactNode;
};

type PropertyTableProps<T> = {
  columns: PropertyTableColumns<T>[];
  items: T[];
  scheme?: PropertyTableScheme;
  'data-testid'?: string;
};

function PropertyTable<T>({ items, columns, scheme = 'normal', ...rest }: PropertyTableProps<T>): JSX.Element {
  return (
    <PropertyTableContainer {...rest}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <PropertyTableRowItemHeader key={index} scheme={scheme} data-testid="property-table-header">
              {col.label}
            </PropertyTableRowItemHeader>
          ))}
        </tr>
      </thead>

      <tbody>
        {items.map((row, index) => (
          <PropertyTableRow key={index} data-testid="property-table-row">
            {columns.map((col, index) => (
              <PropertyTableRowItemContent key={index} scheme={scheme} data-testid="property-table-cell">
                {col.accessor ? col.accessor(row) : col.prop ? row[col.prop] : ''}
              </PropertyTableRowItemContent>
            ))}
          </PropertyTableRow>
        ))}
      </tbody>
    </PropertyTableContainer>
  );
}

const PropertyTableContainer = styled.table`
  border-radius: 4px;
  overflow: hidden;
  border-spacing: 0px;
  border-collapse: collapse;
  width: 100%;
`;

const PropertyTableRowItemHeader = styled.th<{ scheme: PropertyTableScheme }>`
  background: ${(p) => (p.scheme === 'dark' ? p.theme.color.bg.black : p.theme.color.bg.silver)};
  color: ${(p) => (p.scheme === 'dark' ? p.theme.color.bg.white : p.theme.color.text.dark)};
  border-right: ${(p) => p.theme.border.mediumWhite};
  border-bottom: ${(p) => p.theme.border.mediumWhite};
  font-size: 0.875rem;
  padding: 0.4rem 1rem;
  font-weight: 400;
  text-align: left;

  &:last-child {
    border-right: none;
  }
`;

const PropertyTableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: ${(p) => p.theme.border.mediumWhite};
  }
`;

const PropertyTableRowItemContent = styled.td<{ scheme: PropertyTableScheme }>`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-right: ${(p) => p.theme.border.mediumWhite};
  background: ${(p) => (p.scheme === 'bright' ? p.theme.color.bg.white : 'transparent')};
  &:last-child {
    border-right: none;
  }
`;

export default PropertyTable;
