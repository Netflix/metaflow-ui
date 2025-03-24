import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { RunStatus } from '@/types';
import Filter from '@components/FilterInput/Filter';
import { FilterOptionRow, FilterPopupTrailing } from '@components/FilterInput/FilterRows';
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
            <LabelStatusRow>
              {value
                ?.split(',')
                .map((status) => isValidStatus(status) && <StatusIndicator status={status} key={status} />)}
            </LabelStatusRow>
          </>
        );
      }}
      value={status}
      onSelect={(v) => updateField('status', v)}
      content={() => (
        <div>
          {options.map(([key, label]) => (
            <FilterOptionRow key={key} onClick={() => updateField('status', key)} selected={!!status?.includes(key)}>
              <StatusRow>
                {isValidStatus(key) && <StatusIndicator status={key} />}
                {label}
              </StatusRow>
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

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LabelStatusRow = styled(StatusRow)`
  margin-left: 0.5rem;
`;
export default StatusSelection;
