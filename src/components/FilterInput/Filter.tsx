import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import FilterPopup from '@components/FilterInput/FilterPopup';
import Icon from '@components/Icon';

export type FilterProps = {
  label: string;
  labelRenderer?: (label: string, value?: string | null) => React.ReactNode;
  onSelect?: (k: string) => void;
  onClear?: () => void;
  value?: string | null;
  content: (props: { onSelect?: (k: string) => void; selected: string[]; onClose: () => void }) => React.ReactNode;
  'data-testid'?: string;
};

const Filter: React.FC<FilterProps> = ({ label, labelRenderer, value = '', onSelect, onClear, content, ...rest }) => {
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
          {value && onClear ? (
            <span
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onClear();
                close();
              }}
            >
              <Icon name="cross" size="sm" />
            </span>
          ) : (
            <Icon name="chevron" size="sm" rotate={filterWindowOpen ? -180 : 0} />
          )}
        </FilterIcon>
      </FilterButton>
      {filterWindowOpen && <FilterPopup onClose={close}>{content({ onSelect, selected, onClose: close })}</FilterPopup>}
    </FilterBase>
  );
};

export const DefaultLabelRenderer = (label: string, value?: string | null) => {
  const { t } = useTranslation();
  const selectedValues = value?.split(',') || [];

  const valueLabel =
    selectedValues?.length > 1 ? `${selectedValues.length} ${t('filters.selected')}` : selectedValues?.[0];

  return (
    <>
      {`${label}${value ? ':' : ''}`}
      {value ? <SelectedValue>{valueLabel}</SelectedValue> : ''}
    </>
  );
};

const FilterBase = styled.div`
  position: relative;
  white-space: nowrap;
  min-width: 1rem;
`;

const FilterButton = styled.div`
  padding: 0rem 0.5rem;
  border: var(--input-border);
  border-radius: var(--radius-primary);
  color: var(--input-text-color);
  min-height: 1.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: var(--font-size-primary);
  line-height: 1;
  overflow: hidden;
`;

const FilterIcon = styled.div`
  margin-left: 0.375rem;
  display: flex;
  align-items: center;
  color: #6a6867;
`;

const SelectedValue = styled.div`
  font-weight: bold;
  margin-left: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export default Filter;
