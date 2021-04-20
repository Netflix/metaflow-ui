import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AsyncStatus } from '../../types';
import FilterInput from '../FilterInput';
import { Spinner } from '../Spinner';

type SearchFieldProps = {
  initialValue?: string;
  onUpdate: (str: string, forceUpdate?: boolean) => void;
  status: AsyncStatus;
};

//
// Makes debounced search field, send updates to parent only every 300ms
//

const SearchField: React.FC<SearchFieldProps> = ({ initialValue, onUpdate, status }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>(initialValue || '');
  const [debouncedTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    onUpdate(debouncedTerm);
  }, [debouncedTerm]); // eslint-disable-line

  return (
    <SearchFieldContainer title={t('task.search-tasks-tip')}>
      <FilterInput
        sectionLabel={t('search.search')}
        initialValue={initialValue}
        onChange={(e) => setSearchTerm(e)}
        onSubmit={(str) => {
          onUpdate(str, true);
        }}
        noIcon
        noClear
      />
      <SearchLoader>
        <Spinner visible={status === 'Loading'} />
      </SearchLoader>
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

const SearchLoader = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 0.675rem;
  pointer-events: none;
`;

export default SearchField;
