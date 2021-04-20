import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ItemRow } from '../../Structure';
import { ForceNoWrapText } from '../../Text';
import { RowCounts } from '../../Timeline/taskdataUtils';
import StatusLights from './StatusLights';
import { CheckboxField, DropdownField } from '../../Form';
import Icon from '../../Icon';
import { TaskListSort, TasksSortBy } from '../../Timeline/useTaskListSettings';

//
// Typedef
//

export type CustomSettingsProps = {
  updateSort: (order: TasksSortBy, direction: string) => void;
  updateStatusFilter: (status: null | string) => void;
  updateGroupBy: (group: boolean) => void;
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
            horizontal
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
              ['failed', t('run.filter-failed') + ` (${counts.failed})`],
            ]}
            labelRenderer={(value, label) => <StatusLabelRenderer val={label} status={value} />}
            optionRenderer={(value, label) => <StatusLabelRenderer val={label} status={value} noTitle />}
          />
        </TaskListDropdownContainer>

        <TaskListDropdownContainer>
          <DropdownField
            horizontal
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
            optionRenderer={(value) => <OrderLabelRenderer val={value} noTitle />}
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

const StatusLabelRenderer: React.FC<{ val: string; status: string | null | undefined; noTitle?: boolean }> = ({
  val,
  status,
  noTitle,
}) => {
  const { t } = useTranslation();
  return (
    <StatusLabelContainer>
      {!noTitle && <DropdownLabelTitle>{t('fields.status')}</DropdownLabelTitle>}
      <ForceNoWrapText>{val}</ForceNoWrapText>
      <StatusLights status={status || 'all'} />
    </StatusLabelContainer>
  );
};

const OrderLabelRenderer: React.FC<{ val: string; noTitle?: boolean }> = ({ val, noTitle }) => {
  const { t } = useTranslation();
  const [str, direction] = val.split(',');
  return (
    <OrderLabelContainer>
      {!noTitle && <DropdownLabelTitle>{t('timeline.order-by')}</DropdownLabelTitle>}
      <OrderLabelValue>
        {t(`timeline.${str}`)} <Icon size="xs" name="arrowPointTop" rotate={direction === 'asc' ? 180 : 0} />
      </OrderLabelValue>
    </OrderLabelContainer>
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

const StatusLabelContainer = styled.div`
  display: flex;
  min-width: 8.5rem;
`;

const OrderLabelContainer = styled.div`
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
  margin: 0 0.375rem;

  button {
    padding-left: 1rem;
    padding-right: 1rem;

    &:hover {
      background: transparent;
      border-color: #333;
    }
  }
`;

const DropdownLabelTitle = styled(ForceNoWrapText)`
  background: #fff;
  font-size: 0.625rem;
  font-weight: bold;
  left: 0.75rem;
  margin-right: 0.3125rem;
  padding: 0 0.25rem;
  position: absolute;
  top: -0.5rem;
`;

export default CustomSettings;
