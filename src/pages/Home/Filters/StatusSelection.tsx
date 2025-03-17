import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FilterOptionRow, FilterPopupTrailing } from '@/components/FilterInput/FilterRows';
import { RunStatus } from '@/types';
import Filter from '@components/FilterInput/Filter';
import StatusIndicator from '@components/StatusIndicator';
import FEATURE_FLAGS from '@utils/FEATURE';

type Props = {
  updateField: (key: string, value: string) => void;
  onClear: () => void;
  status?: string | null;
};

const StatusSelection: React.FC<Props> = ({ updateField, onClear, status }) => {
  const { t } = useTranslation();

  if (FEATURE_FLAGS.HIDE_STATUS_FILTERS) return;

  const options = [
    ['completed', t('run.filter-completed')],
    ['running', t('run.filter-running')],
    ['failed', t('run.filter-failed')],
  ];

  return (
    <Filter
      label={t('fields.status-filter') ?? ''}
      labelRenderer={(label, value) => {
        return (
          <>
            {label}
            <StatusLights>
              {value
                ?.split(',')
                .map((status) => isValidStatus(status) && <StatusIndicator status={status} key={status} />)}
            </StatusLights>
          </>
        );
      }}
      value={status}
      onSelect={(v) => updateField('status', v)}
      content={() => (
        <div>
          {options.map(([key, label]) => (
            <FilterOptionRow key={key} onClick={() => updateField('status', key)} selected={!!status?.includes(key)}>
              {isValidStatus(key) && <StatusIndicator status={key} />}
              {label}
            </FilterOptionRow>
          ))}
          <FilterPopupTrailing
            clear={{
              onClick: onClear,
              disabled: isAllSelected(status),
            }}
          />
        </div>
      )}
    />
  );
};

function isValidStatus(status: string): status is keyof RunStatus {
  return ['completed', 'running', 'failed'].includes(status);
}

function isAllSelected(status?: string | null) {
  return !status || ['completed', 'running', 'failed'].every((s) => status.includes(s));
}

const StatusLights = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;

  & > * {
    margin-right: 0.25rem;
  }
`;

export default StatusSelection;
