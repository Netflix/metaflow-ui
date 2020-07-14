import React from 'react';
import styled from 'styled-components';

type PropertyTableItem = {
  label: string;
  content: React.ReactNode;
};

type PropertyTableLayout = 'dark' | 'bright' | 'normal';

type PropertyTableProps = {
  items: PropertyTableItem[];
  layout?: PropertyTableLayout;
  noHeader?: boolean;
};

const PropertyTable: React.FC<PropertyTableProps> = ({ items, layout = 'normal', noHeader }) => {
  return (
    <PropertyTableRow layout={layout}>
      {items.map(({ label, content }) => (
        <PropertyTableRowItem key={label}>
          {!noHeader && <PropertyTableRowItemHeader layout={layout}>{label}</PropertyTableRowItemHeader>}
          <PropertyTableRowItemContent layout={layout}>{content}</PropertyTableRowItemContent>
        </PropertyTableRowItem>
      ))}
    </PropertyTableRow>
  );
};

const PropertyTableRow = styled.div<{ layout: PropertyTableLayout }>`
  display: flex;
  border-radius: 4px;
  overflow: hidden;
`;

const PropertyTableRowItem = styled.div`
  flex: 1;
  white-space: pre;

  &:last-child {
    border-right: none;
  }
`;

const PropertyTableRowItemHeader = styled.div<{ layout: PropertyTableLayout }>`
  background: ${(p) => (p.layout === 'dark' ? p.theme.color.bg.dark : p.theme.color.bg.blueGray)};
  color: ${(p) => (p.layout === 'dark' ? '#fff' : p.theme.color.text.dark)};
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  padding: 0.4rem 1rem;
`;

const PropertyTableRowItemContent = styled.div<{ layout: PropertyTableLayout }>`
  padding: 0.75rem 1rem;
  font-size: 14px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: ${(p) => (p.layout === 'bright' ? '#fff' : 'transparent')};
`;

export default PropertyTable;
