import React from 'react';
import styled from 'styled-components';

type DataHeaderItemType = {
  label: string;
  value: React.ReactNode;
  hidden?: boolean;
};

type Props = {
  items: DataHeaderItemType[];
  wide?: boolean;
};

const DataHeader: React.FC<Props> = ({ items, wide = false }) => {
  return (
    <DataHeaderContainer isWide={wide}>
      <DataHeaderContent>
        {items.map((item) => (!item.hidden ? <DataHeaderItem label={item.label} value={item.value} /> : null))}
      </DataHeaderContent>
    </DataHeaderContainer>
  );
};

const DataHeaderContainer = styled.div<{ isWide: boolean }>`
  background: ${(p) => p.theme.color.bg.black};
  font-size: 0.875rem;
  color: #fff;
  margin: 0 ${(p) => (p.isWide ? '-3rem' : '0')};
  padding: 1rem ${(p) => (p.isWide ? '3rem' : '0.5rem')};
`;

const DataHeaderContent = styled.div`
  display: flex;
  max-width: ${(p) => p.theme.layout.maxWidth}px;
  width: 100%;
`;

const DataHeaderItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <DataHeaderItemContainer>
    <DataHeaderItemLabel>{label}</DataHeaderItemLabel>
    <div>{value}</div>
  </DataHeaderItemContainer>
);

const DataHeaderItemContainer = styled.div`
  flex: auto;

  &:not(:first-child),
  &:not(:last-child) {
    padding: 0 0.5rem;
  }
`;

const DataHeaderItemLabel = styled.div`
  font-weight: 500;
`;

export default DataHeader;
