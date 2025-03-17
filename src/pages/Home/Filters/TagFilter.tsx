import React from 'react';
import styled from 'styled-components';
import AutoCompleteFilter from '@components/FilterInput/AutoCompleteFilter';
import { DefaultLabelRenderer } from '@components/FilterInput/Filter';

type Props = {
  onSelect: (v: string) => void;
  onClear?: () => void;
  tags: string;
  prefix?: string;
  label: string;
  autoCompleteInputTransform: (v: string) => Record<string, string>;
};

const TagFilter: React.FC<Props> = ({ onSelect, tags, prefix, label, autoCompleteInputTransform, ...rest }) => {
  return (
    <AutoCompleteFilter
      {...rest}
      data-testid="filter-input-project"
      onSelect={onSelect}
      label={label}
      labelRenderer={(label, value) => labelRenderer(label, value, prefix)}
      value={extractTypesOfTag(tags, prefix).join(',')}
      autoCompleteSettings={{
        url: '/tags/autocomplete',
        params: autoCompleteInputTransform,
      }}
      optionLabelRenderer={(value) => optionLabelRenderer(value, prefix)}
    />
  );
};

function labelRenderer(label: string, value?: string | null, prefix?: string) {
  return DefaultLabelRenderer(
    label,
    value
      ?.split(',')
      .map((selectedValue) =>
        prefix && selectedValue.startsWith(prefix) ? selectedValue.split(':')[1] : selectedValue,
      )
      .join(', '),
  );
}

function optionLabelRenderer(value: string, prefix?: string) {
  if (!prefix || !value.startsWith(prefix)) return value;
  const [tagType, label] = value.split(':');
  return (
    <div>
      <OptionLabelTagType>{tagType}:</OptionLabelTagType>
      <span>{label}</span>
    </div>
  );
}

const OptionLabelTagType = styled.span`
  color: var(--color-text-light);
  margin-right: 0.25rem;
  text-transform: capitalize;
`;

function extractTypesOfTag(tags: string, tagType?: string): string[] {
  if (!tags) return [];
  if (!tagType) return tags.split(',');
  return tags.split(',').filter((tag) => tag.startsWith(`${tagType}:`));
}

export default TagFilter;
