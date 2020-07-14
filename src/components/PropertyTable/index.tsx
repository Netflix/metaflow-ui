import React from 'react';
import styled from 'styled-components';

type PropertyTableLayout = 'dark' | 'bright' | 'normal';

type PropertyTableColumns<T> = {
  label: React.ReactNode;
  prop?: keyof T;
  accessor?: (item: T) => React.ReactNode;
};

type PropertyTableProps<T> = {
  columns: PropertyTableColumns<T>[];
  items: T[];
  layout?: PropertyTableLayout;
};

function PropertyTable<T>({ items, columns, layout = 'normal' }: PropertyTableProps<T>): JSX.Element {
  return (
    <PropertyTableContainer>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <PropertyTableRowItemHeader key={index} layout={layout}>
              {col.label}
            </PropertyTableRowItemHeader>
          ))}
        </tr>
      </thead>

      <tbody>
        {items.map((row, index) => (
          <tr key={index}>
            {columns.map((col, index) => (
              <PropertyTableRowItemContent key={index} layout={layout}>
                {col.accessor ? col.accessor(row) : col.prop ? row[col.prop] : ''}
              </PropertyTableRowItemContent>
            ))}
          </tr>
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

const PropertyTableRowItemHeader = styled.th<{ layout: PropertyTableLayout }>`
  background: ${(p) => (p.layout === 'dark' ? p.theme.color.bg.dark : p.theme.color.bg.blueGray)};
  color: ${(p) => (p.layout === 'dark' ? '#fff' : p.theme.color.text.dark)};
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  padding: 0.4rem 1rem;
`;

const PropertyTableRowItemContent = styled.td<{ layout: PropertyTableLayout }>`
  padding: 0.75rem 1rem;
  font-size: 14px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: ${(p) => (p.layout === 'bright' ? '#fff' : 'transparent')};
`;

export default PropertyTable;
