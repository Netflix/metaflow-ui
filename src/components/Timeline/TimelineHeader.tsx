import React, { useState } from 'react';
import { GraphState, GraphSortBy } from './useGraph';
import { CheckboxField, DropdownField } from '../Form';
import { ItemRow } from '../Structure';
import { Text } from '../Text';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import Icon, { SortIcon } from '../Icon';
import { useTranslation } from 'react-i18next';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import SearchField from '../SearchField';
import SettingsButton from './SettingsButton';
import { RowCounts } from './useRowData';

export type TimelineHeaderProps = {
  zoom?: (dir: 'in' | 'out') => void;
  zoomReset?: () => void;
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
  updateGroup: (group: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setMode: (str: string) => void;
  setFullscreen?: () => void;
  isFullscreen?: boolean;
  selectedStatus: string;
  updateStatusFilter: (status: null | string) => void;
  graph: GraphState;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
};

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  graph,
  zoom,
  zoomReset,
  updateSortBy,
  updateSortDir,
  selectedStatus,
  updateGroup,
  expandAll,
  setMode,
  collapseAll,
  isFullscreen,
  setFullscreen,
  updateStatusFilter,
  searchField,
  counts,
}) => {
  const { t } = useTranslation();
  const [customFiltersOpen, setCustomFiltersOpen] = useState(false);
  const activeMode = getMode(graph, selectedStatus);

  return (
    <TimelineHeaderContainer>
      <TimelineHeaderBottom>
        <TimelineHeaderBottomLeft>
          <SearchField
            initialValue={searchField.fieldProps.text}
            onUpdate={searchField.fieldProps.setText}
            status={searchField.results.status}
          />
          <SettingsButton expand={() => expandAll()} collapse={() => collapseAll()} />
        </TimelineHeaderBottomLeft>
        <TimelineHeaderBottomRight>
          <ItemRow>
            <ButtonGroup>
              <Button active={activeMode === 'overview'} onClick={() => setMode('overview')}>
                Overview
              </Button>
              <Button active={activeMode === 'monitoring'} onClick={() => setMode('monitoring')}>
                Monitoring
              </Button>
              <Button active={activeMode === 'error-tracker'} onClick={() => setMode('error-tracker')}>
                Error tracker
              </Button>
              <Button active={activeMode === 'custom'} onClick={() => setCustomFiltersOpen(true)}>
                <Icon name="ellipsis" />
              </Button>
            </ButtonGroup>

            <AdvancedFiltersOverlay show={customFiltersOpen}>
              <CustomFilters
                updateSortBy={updateSortBy}
                updateSortDir={updateSortDir}
                updateStatusFilter={updateStatusFilter}
                updateGroupBy={updateGroup}
                selectedStatus={selectedStatus}
                graph={graph}
                counts={counts}
                onClose={() => setCustomFiltersOpen(false)}
              />
            </AdvancedFiltersOverlay>
          </ItemRow>

          {zoomReset && zoom && setFullscreen && (
            <ItemRow noWidth>
              <Text>{t('timeline.zoom')}:</Text>
              <ButtonGroup>
                <Button
                  size="sm"
                  onClick={() => zoomReset()}
                  active={!graph.controlled}
                  data-testid="timeline-header-zoom-fit"
                >
                  {t('timeline.fit-to-screen')}
                </Button>
                <Button size="sm" onClick={() => zoom('out')} data-testid="timeline-header-zoom-out">
                  <Icon name="minus" />
                </Button>
                <Button size="sm" onClick={() => zoom('in')} data-testid="timeline-header-zoom-in">
                  <Icon name="plus" />
                </Button>
              </ButtonGroup>
              {!isFullscreen && (
                <Button onClick={() => setFullscreen()} iconOnly>
                  <Icon name="maximize" />
                </Button>
              )}
            </ItemRow>
          )}
        </TimelineHeaderBottomRight>
      </TimelineHeaderBottom>
    </TimelineHeaderContainer>
  );
};

function getMode(graph: GraphState, status: string) {
  if (graph.group === true && status === 'all' && graph.sortBy === 'startTime' && graph.sortDir === 'asc') {
    return 'overview';
  } else if (graph.group === false && status === 'all' && graph.sortBy === 'startTime' && graph.sortDir === 'desc') {
    return 'monitoring';
  } else if (graph.group === true && status === 'failed' && graph.sortBy === 'startTime' && graph.sortDir === 'asc') {
    return 'error-tracker';
  }
  return 'custom';
}

export type CustomFiltersProps = {
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
  updateStatusFilter: (status: null | string) => void;
  updateGroupBy: (group: boolean) => void;
  selectedStatus: string;
  graph: GraphState;
  counts: RowCounts;
  onClose: () => void;
};

const CustomFilters: React.FC<CustomFiltersProps> = ({
  updateStatusFilter,
  updateSortBy,
  updateSortDir,
  updateGroupBy,
  graph,
  selectedStatus,
  counts,
  onClose,
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

        <TimelineHeaderItem pad="sm">
          <Text>{t('fields.status')}:</Text>
          <DropdownField
            horizontal
            onChange={(e) => {
              // setStatus(e?.target.value || 'all');
              if (e?.target.value === 'all') {
                updateStatusFilter(null);
              } else {
                updateStatusFilter(e?.target.value || null);
              }
            }}
            value={selectedStatus}
            options={[
              ['all', t('run.filter-all') + ` (${counts.all})`],
              ['completed', t('run.filter-completed') + ` (${counts.completed})`],
              ['running', t('run.filter-running') + ` (${counts.running})`],
              ['failed', t('run.filter-failed') + ` (${counts.failed})`],
            ]}
          />
          <div style={{ marginLeft: '1rem' }}>
            <CheckboxField
              label={t('timeline.group-by-step')}
              checked={graph.group}
              onChange={() => updateGroupBy(!graph.group)}
              data-testid="timeline-header-groupby-step"
            />
          </div>
        </TimelineHeaderItem>
      </ItemRow>
      <div onClick={onClose} style={{ cursor: 'pointer' }}>
        <Icon size="lg" name="times" />
      </div>
    </ItemRow>
  );
};

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

const TimelineHeaderContainer = styled.div`
  border-bottom: ${(p) => p.theme.border.mediumLight};
  font-size: 14px;
  position: relative;
`;

const TimelineHeaderBottom = styled.div`
  display: flex;

  .field.field-checkbox {
    margin-bottom: 0;
  }
`;

const TimelineHeaderBottomLeft = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(p) => `${p.theme.spacer.md}rem ${p.theme.spacer.sm}rem ${p.theme.spacer.md}rem 0`};
  width: 245px;
  border-right: 1px solid ${(p) => p.theme.color.border.light};

  .field-text {
    font-size: 12px;
    width: 100%;
  }
`;

const TimelineHeaderBottomRight = styled.div`
  padding: ${(p) => p.theme.spacer.md}rem;
  padding-right: 0;
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const TimelineHeaderItem = styled(ItemRow)`
  margin: 0 1rem;
`;

const AdvancedFiltersOverlay = styled.div<{ show: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;

  pointer-events: ${(p) => (p.show ? 'all' : 'none')};
  opacity: ${(p) => (p.show ? 1 : 0)};
  transition: 0.15s opacity;
`;

export default TimelineHeader;
