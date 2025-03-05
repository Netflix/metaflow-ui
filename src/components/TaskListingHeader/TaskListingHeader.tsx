import React from 'react';
import { ItemRow } from '../Structure';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import Icon from '../Icon';
import { useTranslation } from 'react-i18next';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import SearchField from '../SearchField';
import CollapseButton from './components/CollapseButton';
import { RowCounts } from '../Timeline/taskdataUtils';
import CustomSettings from './components/CustomSettings';
import FEATURE_FLAGS from '../../utils/FEATURE';
import { SetQuery } from 'use-query-params';
import { TaskListMode, TaskSettingsQueryParameters, TaskSettingsState } from '../Timeline/useTaskListSettings';
import { Run } from '../../types';
import { getRunId } from '../../utils/run';

//
// Typedef
//

export type TaskListingProps = {
  run: Run;
  onToggleCollapse: (type: 'expand' | 'collapse') => void;
  onModeSelect: (mode: TaskListMode) => void;
  onSetFullscreen?: () => void;
  onZoom?: (type: 'in' | 'out' | 'reset') => void;
  isFullscreen?: boolean;
  userZoomed?: boolean;
  settings: TaskSettingsState;
  setQueryParam: SetQuery<TaskSettingsQueryParameters>;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
  isAnyGroupOpen: boolean;
};

//
// Horizontal row with controls for task list (Timeline and task page)
//

const TaskListingHeader: React.FC<TaskListingProps> = ({
  run,
  onModeSelect,
  onToggleCollapse,
  onSetFullscreen,
  onZoom,
  settings,
  setQueryParam,
  isFullscreen,
  searchField,
  counts,
  userZoomed = false,
  isAnyGroupOpen,
}) => {
  const { t } = useTranslation();
  const activeMode = getMode(settings);

  const autoCompleteSettings = {
    url: `/flows/${run.flow_id}/runs/${getRunId(run)}/artifacts/autocomplete`,
    params: (input: string) => ({
      'name:co': input,
    }),
  };

  const autoCompleteEnabled = (str: string) => str.indexOf(':') === -1;

  return (
    <TaskListingContainer>
      <SettingsRow>
        <SettingsRowLeft>
          <CollapseButton
            disabled={!settings.group}
            expand={() => onToggleCollapse('expand')}
            collapse={() => onToggleCollapse('collapse')}
            isAnyGroupOpen={isAnyGroupOpen}
          />
          {(FEATURE_FLAGS.ARTIFACT_SEARCH || FEATURE_FLAGS.FOREACH_VAR_SEARCH) && (
            <SearchField
              initialValue={searchField.fieldProps.text}
              onUpdate={searchField.fieldProps.setText}
              results={searchField.results}
              autoCompleteSettings={autoCompleteSettings}
              autoCompleteEnabled={autoCompleteEnabled}
            />
          )}

          <CustomSettings
            updateSort={(order, direction) => setQueryParam({ order, direction }, 'replaceIn')}
            updateStatusFilter={(status: null | string) => setQueryParam({ status })}
            updateGroupBy={(group) => setQueryParam({ group: group ? 'true' : 'false' }, 'replaceIn')}
            updateMode={(newMode) => onModeSelect(newMode)}
            activeMode={activeMode}
            sort={settings.sort}
            statusFilter={settings.statusFilter}
            group={settings.group}
            counts={counts}
          />
        </SettingsRowLeft>
        <div>
          {(onZoom || onSetFullscreen) && (
            <ItemRow noWidth>
              {onZoom && (
                <ButtonGroup big>
                  <Button
                    size="sm"
                    onClick={() => onZoom('reset')}
                    active={!userZoomed}
                    data-testid="timeline-header-zoom-fit"
                    title={t('timeline.fit-to-screen') ?? ''}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{t('timeline.fit-to-screen')}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onZoom('out')}
                    data-testid="timeline-header-zoom-out"
                    title={t('timeline.zoom-out') ?? ''}
                  >
                    <Icon name="minus" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onZoom('in')}
                    data-testid="timeline-header-zoom-in"
                    title={t('timeline.zoom-in') ?? ''}
                  >
                    <Icon name="plus" />
                  </Button>
                </ButtonGroup>
              )}
              {!isFullscreen && onSetFullscreen && (
                <ExpandButton onClick={() => onSetFullscreen()} iconOnly title={t('timeline.fullscreen') ?? ''}>
                  <Icon name="maximize" />
                </ExpandButton>
              )}
            </ItemRow>
          )}
        </div>
      </SettingsRow>
    </TaskListingContainer>
  );
};

//
// Utils
//

export function getMode(settings: TaskSettingsState): TaskListMode {
  if (settings.isCustomEnabled) {
    return 'custom';
  } else if (
    settings.group === true &&
    !settings.statusFilter &&
    settings.sort[0] === 'startTime' &&
    settings.sort[1] === 'asc'
  ) {
    return 'overview';
  } else if (
    settings.group === false &&
    !settings.statusFilter &&
    settings.sort[0] === 'startTime' &&
    settings.sort[1] === 'desc'
  ) {
    return 'monitoring';
  } else if (
    settings.group === true &&
    settings.statusFilter === 'failed' &&
    settings.sort[0] === 'startTime' &&
    settings.sort[1] === 'asc'
  ) {
    return 'error-tracker';
  }
  return 'custom';
}

//
// Style
//

const TaskListingContainer = styled.div`
  border-bottom: var(--task-list-header-border-bottom);
  font-size: var(--font-size-primary);
  position: relative;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 1rem 0;
  width: 100%;
`;

const SettingsRowLeft = styled.div`
  display: flex;
`;

const ExpandButton = styled(Button)`
  height: var(--input-height);
  width: var(--input-height);

  i {
    margin: 0 auto;
  }
`;

export default TaskListingHeader;
