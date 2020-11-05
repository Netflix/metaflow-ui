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
};

function PropertyTable<T>({ items, columns, scheme = 'normal' }: PropertyTableProps<T>): JSX.Element {
  return (
    <PropertyTableContainer>
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
  background: ${(p) => (p.scheme === 'dark' ? p.theme.color.bg.dark : p.theme.color.bg.silver)};
  color: ${(p) => (p.scheme === 'dark' ? '#fff' : p.theme.color.text.dark)};
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  font-size: 0.875rem;
  padding: 0.4rem 1rem;
  font-weight: 400;
  text-align: left;
`;

const PropertyTableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 2px solid #fff;
  }
`;

const PropertyTableRowItemContent = styled.td<{ scheme: PropertyTableScheme }>`
  padding: 0.75rem 1rem;
  font-size: 14px;
  border-right: 2px solid #fff;
  background: ${(p) => (p.scheme === 'bright' ? '#fff' : 'transparent')};
`;

export default PropertyTable;
