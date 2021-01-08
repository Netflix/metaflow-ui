import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../../Button';
import ButtonGroup from '../../ButtonGroup';
import { ItemRow } from '../../Structure';
import { Text } from '../../Text';
import { RowCounts } from '../../Timeline/taskdataUtils';
import { GraphSortBy, GraphState } from '../../Timeline/useGraph';
import StatusLights from './StatusLights';
import { CheckboxField, DropdownField } from '../../Form';
import { SortIcon } from '../../Icon';

//
// Typedef
//

export type CustomSettingsProps = {
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
  updateStatusFilter: (status: null | string) => void;
  updateGroupBy: (group: boolean) => void;
  graph: GraphState;
  counts: RowCounts;
};

//
// Component
//

const CustomSettings: React.FC<CustomSettingsProps> = ({
  updateStatusFilter,
  updateSortBy,
  updateSortDir,
  updateGroupBy,
  graph,
  counts,
}) => {
  const { t } = useTranslation();
  const SortButtonDef = (label: string, property: GraphSortBy) => (
    <SortButton
      label={label}
      property={property}
      current={graph.sortBy}
      direction={graph.sortDir}
      updateSortBy={updateSortBy}
      updateSortDir={updateSortDir}
    />
  );

  return (
    <ItemRow style={{ height: '100%' }}>
      <ItemRow>
        <Text style={{ whiteSpace: 'nowrap' }}>{t('timeline.order-by')}:</Text>
        <ButtonGroup>
          {SortButtonDef(t('timeline.started-at'), 'startTime')}
          {SortButtonDef(t('timeline.finished-at'), 'endTime')}
          {SortButtonDef(t('timeline.duration'), 'duration')}
        </ButtonGroup>

        <FiltersSection pad="sm">
          <StatusContainer>
            <Text>{t('fields.status')}:</Text>
            <StatusLights status={graph.statusFilter || 'all'} />
            <DropdownField
              horizontal
              onChange={(e) => {
                if (e?.target.value === 'all') {
                  updateStatusFilter(null);
                } else {
                  updateStatusFilter(e?.target.value || null);
                }
              }}
              value={graph.statusFilter || 'all'}
              options={[
                ['all', t('run.filter-all') + ` (${counts.all})`],
                ['completed', t('run.filter-completed') + ` (${counts.completed})`],
                ['running', t('run.filter-running') + ` (${counts.running})`],
                ['failed', t('run.filter-failed') + ` (${counts.failed})`],
              ]}
            />
          </StatusContainer>
          <div>
            <CheckboxField
              label={t('timeline.group-by-step')}
              checked={graph.group}
              onChange={() => updateGroupBy(!graph.group)}
              data-testid="timeline-header-groupby-step"
            />
          </div>
        </FiltersSection>
      </ItemRow>
    </ItemRow>
  );
};

//
// Extra components
//

const SortButton: React.FC<{
  label: string;
  property: GraphSortBy;
  current: GraphSortBy;
  direction: 'asc' | 'desc';
  updateSortDir: () => void;
  updateSortBy: (prop: GraphSortBy) => void;
}> = ({ current, label, property, direction, updateSortDir, updateSortBy }) => (
  <Button
    size="sm"
    onClick={() => {
      if (current === property) {
        updateSortDir();
      } else {
        updateSortBy(property);
      }
    }}
    active={current === property}
    data-testid={`timeline-header-orderby-${property}`}
  >
    {label}
    {current === property ? <HeaderSortIcon dir={direction} /> : null}
  </Button>
);

const HeaderSortIcon: React.FC<{ dir: 'asc' | 'desc' }> = ({ dir }) => (
  <SortIcon padLeft size="sm" active direction={dir === 'asc' ? 'up' : 'down'} />
);

//
// Style
//

const StatusContainer = styled.div`
  display: flex;
  min-width: 180px;
`;

const FiltersSection = styled(ItemRow)`
  margin: 0 1rem;
`;

export default CustomSettings;
