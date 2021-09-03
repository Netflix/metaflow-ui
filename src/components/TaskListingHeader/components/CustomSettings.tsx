import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ItemRow } from '../../Structure';
import { ForceNoWrapText } from '../../Text';
import { RowCounts } from '../../Timeline/taskdataUtils';
import StatusLights from './StatusLights';
import { CheckboxField } from '../../Form/Checkbox';
import DropdownField from '../../Form/Dropdown';
import Icon from '../../Icon';
import { TaskListMode, TaskListSort, TasksSortBy } from '../../Timeline/useTaskListSettings';

//
// Typedef
//

export type CustomSettingsProps = {
  updateSort: (order: TasksSortBy, direction: string) => void;
  updateStatusFilter: (status: null | string) => void;
  updateGroupBy: (group: boolean) => void;
  updateMode: (mode: TaskListMode) => void;
  activeMode: TaskListMode;
  sort: TaskListSort;
  statusFilter?: string | null;
  group: boolean;
  counts: RowCounts;
};

//
// Component
//

const CustomSettings: React.FC<CustomSettingsProps> = ({
  updateStatusFilter,
  updateSort,
  updateGroupBy,
  updateMode,
  activeMode,
  sort,
  statusFilter,
  group,
  counts,
}) => {
  const { t } = useTranslation();

  return (
    <ItemRow style={{ height: '100%' }}>
      <ItemRow>
        <TaskListDropdownContainer>
          <DropdownField
            label={t('run.mode')}
            onChange={(e) => {
              if (e?.target.value) {
                updateMode(e?.target.value as TaskListMode);
              }
            }}
            value={activeMode}
            options={[
              ['overview', t('run.overview')],
              ['monitoring', t('run.monitoring')],
              ['error-tracker', t('run.error-tracker')],
              ['custom', t('run.custom')],
            ]}
          />
        </TaskListDropdownContainer>

        <TaskListDropdownContainer>
          <DropdownField
            label={t('fields.status')}
            onChange={(e) => {
              if (e?.target.value === 'all') {
                updateStatusFilter(null);
              } else {
                updateStatusFilter(e?.target.value || null);
              }
            }}
            value={statusFilter || 'all'}
            options={[
              ['all', t('run.filter-all') + ` (${counts.all})`],
              ['completed', t('run.filter-completed') + ` (${counts.completed})`],
              ['running', t('run.filter-running') + ` (${counts.running})`],
              ['pending', t('run.filter-pending') + ` (${counts.pending})`],
              ['failed', t('run.filter-failed') + ` (${counts.failed})`],
              ...(counts.unknown > 0
                ? ([['unknown', t('run.filter-unknown') + ` (${counts.unknown})`]] as [string, string][])
                : []),
            ]}
            labelRenderer={(value, label) => <StatusLabelRenderer val={label} status={value} />}
            optionRenderer={(value, label) => <StatusLabelRenderer val={label} status={value} />}
          />
        </TaskListDropdownContainer>

        <TaskListDropdownContainer>
          <DropdownField
            label={t('timeline.order-by')}
            onChange={(e) => {
              const val = e?.target.value;
              if (val) {
                const [order, direction] = val.split(',');
                updateSort(order as TasksSortBy, direction);
              }
            }}
            value={`${sort[0]},${sort[1]}`}
            options={[
              ['startTime,asc', t('timeline.startTime')],
              ['startTime,desc', t('timeline.startTime')],
              ['endTime,asc', t('timeline.endTime')],
              ['endTime,desc', t('timeline.endTime')],
              ['duration,asc', t('timeline.duration')],
              ['duration,desc', t('timeline.duration')],
            ]}
            labelRenderer={(value) => <OrderLabelRenderer val={value} />}
            optionRenderer={(value) => <OrderLabelRenderer val={value} />}
          />
        </TaskListDropdownContainer>

        <FiltersSection pad="sm">
          <CheckboxField
            label={t('timeline.group-by-step')}
            checked={group}
            onChange={() => updateGroupBy(!group)}
            data-testid="timeline-header-groupby-step"
          />
        </FiltersSection>
      </ItemRow>
    </ItemRow>
  );
};

//
// Extra components
//

const StatusLabelRenderer: React.FC<{ val: string; status: string | null | undefined }> = ({ val, status }) => {
  return (
    <CustomContainer>
      <ForceNoWrapText>{val}</ForceNoWrapText>
      <StatusLights status={status || 'all'} />
    </CustomContainer>
  );
};

const OrderLabelRenderer: React.FC<{ val: string }> = ({ val }) => {
  const { t } = useTranslation();
  const [str, direction] = val.split(',');
  return (
    <CustomContainer>
      <OrderLabelValue>
        {t(`timeline.${str}`)} <Icon size="xs" name="arrowPointTop" rotate={direction === 'asc' ? 180 : 0} />
      </OrderLabelValue>
    </CustomContainer>
  );
};

//
// Style
//

const FiltersSection = styled(ItemRow)`
  margin: 0 1rem;

  .field-checkbox {
    margin-bottom: 0;
  }
`;

const CustomContainer = styled.div`
  display: flex;
  min-width: 8.5rem;

  i {
    margin-left: 0.5rem;
  }
`;

const OrderLabelValue = styled(ForceNoWrapText)`
  display: flex;
  align-items: center;
`;

const TaskListDropdownContainer = styled.div`
  margin: 0 0.5rem;

  .dropdown-button {
    min-width: 10.5rem;
  }

  @media (max-width: 1400px) {
    .dropdown-button {
      min-width: auto;
    }

    ${CustomContainer} {
      min-width: unset;
    }
  }
`;

export default CustomSettings;
