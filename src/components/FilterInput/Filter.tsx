import React, { useState } from 'react';
import styled from 'styled-components';
import FilterPopup from '@components/FilterInput/FilterPopup';
import Icon from '../Icon';

export type FilterProps = {
  label: string;
  labelRenderer?: (label: string, value?: string | null) => React.ReactNode;
  onSelect?: (k: string) => void;
  value?: string | null;
  content: (props: { onSelect?: (k: string) => void; selected: string[]; onClose: () => void }) => React.ReactNode;
  'data-testid'?: string;
};

const Filter: React.FC<FilterProps> = ({ label, labelRenderer, value = '', onSelect, content, ...rest }) => {
  const [filterWindowOpen, setFilterWindowOpen] = useState(false);
  const selected = value?.split(',').filter((item) => item) || [];

  const close = () => {
    setFilterWindowOpen(false);
  };

  return (
    <FilterBase {...rest}>
      <FilterButton
        onClick={() => {
          setFilterWindowOpen(!filterWindowOpen);
        }}
      >
        {labelRenderer ? labelRenderer(label, value) : DefaultLabelRenderer(label, value)}
        <FilterIcon>
          <Icon name="chevron" size="xs" rotate={filterWindowOpen ? -180 : 0} />
        </FilterIcon>
      </FilterButton>
      {filterWindowOpen && <FilterPopup onClose={close}>{content({ onSelect, selected, onClose: close })}</FilterPopup>}
    </FilterBase>
  );
};

export const DefaultLabelRenderer = (label: string, value?: string | null) => (
  <>
    {`${label}${value ? ':' : ''}`}
    {value ? <SelectedValue>{value}</SelectedValue> : ''}
  </>
);

const FilterBase = styled.div`
  position: relative;
  white-space: nowrap;
  min-width: 1rem;
`;

const FilterButton = styled.div`
  padding: 0.375rem 0.5rem;
  border: var(--input-border);
  border-radius: var(--radius-primary);
  color: var(--input-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: var(--font-size-primary);
  overflow: hidden;
`;

const FilterIcon = styled.div`
  margin-left: 0.375rem;
  display: flex;
  align-items: center;
`;

const SelectedValue = styled.div`
  font-weight: bold;
  margin-left: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export default Filter;
