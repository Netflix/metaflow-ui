import React from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '@components/FilterInput/Filter';
import { FilterOptionRow } from '@components/FilterInput/FilterRows';
import FEATURE_FLAGS from '@utils/FEATURE';

type Props = {
  onChange: (value: string) => void;
  group?: string | null;
};

const GroupBy: React.FC<Props> = ({ onChange, group }) => {
  const { t } = useTranslation();

  if (!FEATURE_FLAGS.RUN_GROUPS) return;

  const options = [
    ['flow_id', t('fields.group.flow')],
    ['user', t('fields.group.user')],
  ];

  const selected = options.find(([value]) => value === group) || ['', ''];

  return (
    <Filter
      label={t('filters.group-by') ?? ''}
      value={selected[1]}
      content={() => (
        <div>
          {options.map(([value, label]) => (
            <FilterOptionRow
              key={value}
              onClick={() => onChange(selected[0] === value ? '' : value)}
              selected={group === value}
            >
              {label}
            </FilterOptionRow>
          ))}
        </div>
      )}
    />
  );
};

export default GroupBy;
