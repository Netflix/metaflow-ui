import React, { ReactNode } from 'react';
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
                {col.accessor ? col.accessor(row) : col.prop ? (row[col.prop] as ReactNode) : ''}
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
    border-top-left-radius: var(--radius-primary);
  }

  thead tr:first-child th:last-child {
    border-top-right-radius: var(--radius-primary);
  }

  tbody tr:last-child td:first-child {
    border-bottom-left-radius: var(--radius-primary);
  }

  tbody tr:last-child td:last-child {
    border-bottom-right-radius: var(--radius-primary);
  }
`;

const PropertyTableRowItemHeader = styled.th<{ scheme: PropertyTableScheme; width?: string }>`
  background: ${(p) => (p.scheme === 'dark' ? 'var(--color-bg-heavy)' : 'var(--color-bg-neutral)')};
  color: ${(p) => (p.scheme === 'dark' ? 'var(--color-text-alternative)' : 'var(--color-text-primary)')};
  border-right: var(--border-alternative-medium);
  border-bottom: var(--border-alternative-medium);
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
    border-bottom: var(--border-alternative-medium);
  }
`;

const PropertyTableRowItemContent = styled.td<{ scheme: PropertyTableScheme }>`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-right: var(--border-alternative-medium);
  background: ${(p) => (p.scheme === 'bright' ? 'var(--color-bg-primary)' : 'transparent')};
  word-break: break-word;
  &:last-child {
    border-right: none;
  }
`;

export default PropertyTable;
