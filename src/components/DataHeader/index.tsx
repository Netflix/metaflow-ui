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

//
// Render full width container or label - value pairs horizontally.
//

const DataHeader: React.FC<Props> = ({ items, wide = false }) => {
  return (
    <DataHeaderContainer data-testid="data-header-container" isWide={wide}>
      <DataHeaderContent>
        {items.map((item) =>
          !item.hidden ? <DataHeaderItem key={item.label} label={item.label} value={item.value} /> : null,
        )}
      </DataHeaderContent>
    </DataHeaderContainer>
  );
};

const DataHeaderItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <DataHeaderItemContainer data-testid="data-header-element">
    <DataHeaderItemLabel>{label}</DataHeaderItemLabel>
    <div>{value}</div>
  </DataHeaderItemContainer>
);

//
// Style
//

const DataHeaderContainer = styled.div<{ isWide: boolean }>`
  background: var(--data-header-bg);
  font-size: var(--data-header-font-size);
  color: var(--data-header-text-color);
  margin: 0 ${(p) => (p.isWide ? 'calc(var(--layout-page-padding-x) * -1)' : '0')};
  padding: ${(p) => (p.isWide ? 'var(--data-header-padding-wide)' : 'var(--data-header-padding)')};
`;

const DataHeaderContent = styled.div`
  display: flex;
  max-width: var(--layout-max-width);
  width: 100%;
`;

const DataHeaderItemContainer = styled.div`
  flex: auto;

  &:not(:first-child),
  &:not(:last-child) {
    padding: 0 0.5rem;
  }
`;

const DataHeaderItemLabel = styled.div`
  font-weight: var(--data-header-label-font-weight);
  font-size: var(--data-header-label-font-size);
  color: var(--data-header-label-text-color);
`;

export default DataHeader;
