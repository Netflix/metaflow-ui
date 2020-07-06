import React from 'react';
import styled from 'styled-components';

type PropertyTableItem = {
  label: string;
  content: React.ReactNode;
};

type PropertyTableProps = {
  items: PropertyTableItem[];
};

const PropertyTable: React.FC<PropertyTableProps> = ({ items }) => {
  return (
    <PropertyTableRow>
      {items.map(({ label, content }) => (
        <PropertyTableRowItem key={label}>
          <PropertyTableRowItemHeader>{label}</PropertyTableRowItemHeader>
          <PropertyTableRowItemContent>{content}</PropertyTableRowItemContent>
        </PropertyTableRowItem>
      ))}
    </PropertyTableRow>
  );
};

const PropertyTableRow = styled.div`
  display: flex;
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

const PropertyTableRowItemContent = styled.div`
  padding: 15px;
  font-size: 14px;
`;

export default PropertyTable;
