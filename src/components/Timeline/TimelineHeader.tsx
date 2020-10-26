import React, { useState } from 'react';
import { GraphState, GraphSortBy, GraphHook } from './useGraph';
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
  expandAll: () => void;
  collapseAll: () => void;
  setMode: (str: string) => void;
  setFullscreen?: () => void;
  isFullscreen?: boolean;
  enableZoomControl?: boolean;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
  isAnyGroupOpen: boolean;
};

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  graph: graphHook,
  expandAll,
  collapseAll,
  setMode,
  isFullscreen,
  setFullscreen,
  searchField,
  counts,
  enableZoomControl = false,
  isAnyGroupOpen,
}) => {
  const { t } = useTranslation();
  const [customFiltersOpen, setCustomFiltersOpen] = useState(false);
  const { graph, setQueryParam } = graphHook;
  const activeMode = getMode(graph);

  return (
    <TimelineHeaderContainer>
      <TimelineHeaderBottom>
        <TimelineHeaderBottomLeft>
          <SearchField
            initialValue={searchField.fieldProps.text}
            onUpdate={searchField.fieldProps.setText}
            status={searchField.results.status}
          />
          <SettingsButton
            disabled={!graph.group}
            expand={() => expandAll()}
            collapse={() => collapseAll()}
            isAnyGroupOpen={isAnyGroupOpen}
          />
        </TimelineHeaderBottomLeft>
        <TimelineHeaderBottomRight>
          <ItemRow>
            <ButtonGroup>
              <Button active={activeMode === 'overview'} onClick={() => setMode('overview')}>
                {t('run.overview')}
              </Button>
              <Button active={activeMode === 'monitoring'} onClick={() => setMode('monitoring')}>
                {t('run.monitoring')}
              </Button>
              <Button active={activeMode === 'error-tracker'} onClick={() => setMode('error-tracker')}>
                {t('run.error-tracker')}
              </Button>
              <Button active={activeMode === 'custom'} onClick={() => setCustomFiltersOpen(true)}>
                {t('run.custom')}
              </Button>
            </ButtonGroup>
            <AdvancedFiltersOverlay show={customFiltersOpen}>
              <CustomFilters
                updateSortBy={(by) => setQueryParam({ order: by }, 'replaceIn')}
                updateSortDir={() =>
                  setQueryParam({ direction: graph.sortDir === 'asc' ? 'desc' : 'asc' }, 'replaceIn')
                }
                updateStatusFilter={(status: null | string) => setQueryParam({ status })}
                updateGroupBy={(group) => setQueryParam({ group: group ? 'true' : 'false' }, 'replaceIn')}
                graph={graph}
                counts={counts}
                onClose={() => setCustomFiltersOpen(false)}
              />
            </AdvancedFiltersOverlay>
          </ItemRow>

          {enableZoomControl && setFullscreen && (
            <ItemRow noWidth>
              <Text>{t('timeline.zoom')}:</Text>
              <ButtonGroup>
                <Button
                  size="sm"
                  onClick={() => graphHook.dispatch({ type: 'resetZoom' })}
                  active={!graph.controlled}
                  data-testid="timeline-header-zoom-fit"
                >
                  {t('timeline.fit-to-screen')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => graphHook.dispatch({ type: 'zoomOut' })}
                  data-testid="timeline-header-zoom-out"
                >
                  <Icon name="minus" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => graphHook.dispatch({ type: 'zoomIn' })}
                  data-testid="timeline-header-zoom-in"
                >
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

function getMode(graph: GraphState) {
  if (graph.group === true && !graph.statusFilter && graph.sortBy === 'startTime' && graph.sortDir === 'asc') {
    return 'overview';
  } else if (graph.group === false && !graph.statusFilter && graph.sortBy === 'startTime' && graph.sortDir === 'desc') {
    return 'monitoring';
  } else if (
    graph.group === true &&
    graph.statusFilter === 'failed' &&
    graph.sortBy === 'startTime' &&
    graph.sortDir === 'asc'
  ) {
    return 'error-tracker';
  }
  return 'custom';
}

export type CustomFiltersProps = {
  updateSortBy: (by: GraphSortBy) => void;
  updateSortDir: () => void;
  updateStatusFilter: (status: null | string) => void;
  updateGroupBy: (group: boolean) => void;
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
            value={graph.statusFilter || 'all'}
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
