import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import FilterInput, { InputAutocompleteSettings } from '../FilterInput';
import { SearchResultModel } from '../../hooks/useSearchField';
import Icon from '../Icon';

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

  const handleChange = (e: string) => {
    if (!e) {
      onUpdate('', true);
    }
  };

  const handleSubmit = (str: string) => {
    onUpdate(str, true);
  };

  return (
    <SearchFieldContainer title={t('task.search-tasks-tip')}>
      <FilterInput
        sectionLabel={t('search.artifact')}
        initialValue={initialValue}
        onChange={handleChange}
        onSubmit={handleSubmit}
        noClear
        customIcon={['search', 'sm']}
        customIconElement={results.status === 'Loading' ? <Icon name="rowLoader" spin /> : null}
        autoCompleteSettings={autoCompleteSettings}
        autoCompleteEnabled={autoCompleteEnabled}
        tip="key:value"
        status={results.status}
        infoMsg={t('search.artifactInfo')}
        errorMsg={(results.status === 'Error' && results.errorMsg) || undefined}
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
