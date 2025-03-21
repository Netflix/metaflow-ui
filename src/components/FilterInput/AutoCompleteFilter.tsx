import React, { useState } from 'react';
import styled from 'styled-components';
import Filter, { FilterProps } from '@components/FilterInput/Filter';
import { FilterOptionRow, FilterPopupTrailing } from '@components/FilterInput/FilterRows';
import InputWrapper from '@components/Form/InputWrapper';
import useAutoComplete, { AutoCompleteItem } from '@hooks/useAutoComplete';

export type InputAutocompleteSettings = {
  url: string;
  finder?: (item: AutoCompleteItem, input: string) => boolean;
  params?: (input: string) => Record<string, string>;
  preFetch?: boolean;
};

type Props = {
  onSelect: (k: string) => void;
  onClear?: () => void;
  autoCompleteSettings?: InputAutocompleteSettings;
  optionLabelRenderer?: (value: string) => React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
} & Omit<FilterProps, 'content'>;

const AutoCompleteFilter: React.FC<Props> = ({
  autoCompleteSettings,
  onClear,
  optionLabelRenderer,
  inputProps = {},
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const { result: autoCompleteResult } = useAutoComplete<string>(
    autoCompleteSettings
      ? {
          ...autoCompleteSettings,
          params: autoCompleteSettings.params ? autoCompleteSettings.params(inputValue) : {},
          input: inputValue,
          enabled: !!autoCompleteSettings,
        }
      : { url: '', input: '', enabled: false },
  );

  return (
    <Filter
      {...props}
      content={({ selected, onClose }) => (
        <Content>
          <FilterPopupHeading>
            <InputWrapper active={true} size="sm">
              <input type="text" onChange={(event) => setInputValue(event.target.value)} {...inputProps} />
            </InputWrapper>
          </FilterPopupHeading>

          {selected.map(
            (item) =>
              item && (
                <FilterOptionRow key={item} onClick={() => props.onSelect(item)} selected={true}>
                  {optionLabelRenderer ? optionLabelRenderer(item) : item}
                </FilterOptionRow>
              ),
          )}

          {autoCompleteResult.data
            .filter((item) => !selected.includes(item.value))
            .map((item) => (
              <FilterOptionRow key={item.value} onClick={() => props.onSelect(item.value)} selected={false}>
                {optionLabelRenderer ? optionLabelRenderer(item.value) : item.value}
              </FilterOptionRow>
            ))}

          {onClear && (
            <FilterPopupTrailing
              clear={{
                onClick: () => {
                  onClear();
                  onClose();
                },
                disabled: selected.length === 0,
              }}
            />
          )}
        </Content>
      )}
    />
  );
};

const Content = styled.div`
  width: auto;
`;

const FilterPopupHeading = styled.div`
  margin-bottom: 0.75rem;
`;

export default AutoCompleteFilter;
