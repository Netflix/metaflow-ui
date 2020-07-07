import React from 'react';
import styled from 'styled-components';

type PropertyTableItem = {
  label: string;
  content: React.ReactNode;
};

type PropertyTableLayout = 'bright' | 'normal';

type PropertyTableProps = {
  items: PropertyTableItem[];
  layout?: PropertyTableLayout;
};

const PropertyTable: React.FC<PropertyTableProps> = ({ items, layout = 'normal' }) => {
  return (
    <PropertyTableRow layout={layout}>
      {items.map(({ label, content }) => (
        <PropertyTableRowItem key={label}>
          <PropertyTableRowItemHeader>{label}</PropertyTableRowItemHeader>
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
  border-right: 1px solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-right: none;
  }
`;

const PropertyTableRowItemHeader = styled.div`
  background: #e8e8e8;
  color: ${({ theme }) => theme.color.text.mid};
  font-size: 12px;
  padding: 7px 15px;
`;

const PropertyTableRowItemContent = styled.div<{ layout: PropertyTableLayout }>`
  padding: 15px;
  font-size: 14px;
  background: ${(p) => (p.layout === 'bright' ? '#fff' : 'transparent')};
`;

export default PropertyTable;
