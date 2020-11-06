import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { AsyncStatus } from '../../types';
import { TextInputField } from '../Form';

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
    <TextInputField
      defaultValue={initialValue}
      placeholder={t('task.search-tasks')}
      onChange={(e) => e && setSearchTerm(e.currentTarget.value)}
      onKeyPress={(e) => {
        if (e.charCode === 13) {
          const val = e.currentTarget.value;
          if (val) {
            onUpdate(val, true);
          }
        }
      }}
      loading={status === 'Loading'}
      horizontal
      async
    />
  );
};

export default SearchField;
