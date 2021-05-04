import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import FilterInput, { InputAutocompleteSettings } from '../FilterInput';
import { SearchResultModel } from '../../hooks/useSearchField';

type SearchFieldProps = {
  initialValue?: string;
  onUpdate: (str: string, forceUpdate?: boolean) => void;
  results: SearchResultModel;
  autoCompleteSettings?: InputAutocompleteSettings;
  autoCompleteEnabled?: (str: string) => boolean;
};

//
// Makes debounced search field, send updates to parent only every 300ms
//

const SearchField: React.FC<SearchFieldProps> = ({
  initialValue,
  onUpdate,
  results,
  autoCompleteSettings,
  autoCompleteEnabled,
}) => {
  const { t } = useTranslation();

  return (
    <SearchFieldContainer title={t('task.search-tasks-tip')}>
      <FilterInput
        sectionLabel={t('search.artifact')}
        initialValue={initialValue}
        onChange={(e) => {
          if (!e) {
            onUpdate('', true);
          }
        }}
        onSubmit={(str) => {
          onUpdate(str, true);
        }}
        noClear
        customIcon={['search', 'sm']}
        autoCompleteSettings={autoCompleteSettings}
        autoCompleteEnabled={autoCompleteEnabled}
        tip="key:value"
        status={results.status}
        errorMsg={(results.status === 'Error' && results.error.message) || undefined}
      />
    </SearchFieldContainer>
  );
};

//
// Style
//

const SearchFieldContainer = styled.div`
  width: 18rem;
  margin: 0 0.375rem;
  position: relative;
`;

export default SearchField;
