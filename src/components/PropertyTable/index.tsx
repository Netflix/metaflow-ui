import React from 'react';
import styled from 'styled-components';

//
// Typedef
//

type PropertyTableScheme = 'dark' | 'bright' | 'normal';

export type PropertyTableColumns<T> = {
  label: React.ReactNode;
  prop?: keyof T;
  accessor?: (item: T) => React.ReactNode;
  width?: string; // Needs to be valid for css width property
};

type PropertyTableProps<T> = {
  columns: PropertyTableColumns<T>[];
  items: T[];
  scheme?: PropertyTableScheme;
  'data-testid'?: string;
};

//
// Basic property table.
//

function PropertyTable<T>({ items, columns, scheme = 'normal', ...rest }: PropertyTableProps<T>): JSX.Element {
  return (
    <PropertyTableContainer {...rest}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <PropertyTableRowItemHeader
              key={index}
              scheme={scheme}
              data-testid="property-table-header"
              width={col.width}
            >
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

//
// Style
//

const PropertyTableContainer = styled.table`
  border-spacing: 0px;
  border-collapse: collapse;
  width: 100%;

  thead tr:first-child th:first-child {
    border-top-left-radius: 0.25rem;
  }

  thead tr:first-child th:last-child {
    border-top-right-radius: 0.25rem;
  }

  tbody tr:last-child td:first-child {
    border-bottom-left-radius: 0.25rem;
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: 0.25rem;
  }
`;

const PropertyTableRowItemHeader = styled.th<{ scheme: PropertyTableScheme; width?: string }>`
  background: ${(p) => (p.scheme === 'dark' ? p.theme.color.bg.black : p.theme.color.bg.silver)};
  color: ${(p) => (p.scheme === 'dark' ? p.theme.color.bg.white : p.theme.color.text.dark)};
  border-right: ${(p) => p.theme.border.mediumWhite};
  border-bottom: ${(p) => p.theme.border.mediumWhite};
  font-size: 0.875rem;
  padding: 0.4rem 1rem;
  font-weight: 500;
  text-align: left;
  white-space: pre;
  ${(p) => (p.width ? `width: ${p.width};` : '')}

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
  word-break: break-word;
  &:last-child {
    border-right: none;
  }
`;

export default PropertyTable;
