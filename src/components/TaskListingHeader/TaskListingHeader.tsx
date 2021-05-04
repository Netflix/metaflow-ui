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
import ModeSelector from './components/ModeSelector';
import FEATURE_FLAGS from '../../utils/FEATURE';
import { SetQuery } from 'use-query-params';
import { TaskListMode, TaskSettingsQueryParameters, TaskSettingsState } from '../Timeline/useTaskListSettings';
import { Run } from '../../types';

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
// Component
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

  return (
    <TaskListingContainer>
      <ModeSelector activeMode={activeMode} select={(newMode) => onModeSelect(newMode)} />

      <SettingsRow>
        <SettingsRowLeft>
          <CollapseButton
            disabled={!settings.group}
            expand={() => onToggleCollapse('expand')}
            collapse={() => onToggleCollapse('collapse')}
            isAnyGroupOpen={isAnyGroupOpen}
          />
          {FEATURE_FLAGS.ARTIFACT_SEARCH && (
            <SearchField
              initialValue={searchField.fieldProps.text}
              onUpdate={searchField.fieldProps.setText}
              results={searchField.results}
              autoCompleteSettings={{
                url: `/flows/${run.flow_id}/runs/${run.run_number || run.run_id}/artifacts/autocomplete`,
                params: (input) => ({
                  'name:co': input,
                }),
              }}
              autoCompleteEnabled={(str) => str.indexOf(':') === -1}
            />
          )}

          <CustomSettings
            updateSort={(order, direction) => setQueryParam({ order, direction }, 'replaceIn')}
            updateStatusFilter={(status: null | string) => setQueryParam({ status })}
            updateGroupBy={(group) => setQueryParam({ group: group ? 'true' : 'false' }, 'replaceIn')}
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
                  >
                    <span style={{ fontSize: '0.875rem' }}>{t('timeline.fit-to-screen')}</span>
                  </Button>
                  <Button size="sm" onClick={() => onZoom('out')} data-testid="timeline-header-zoom-out">
                    <Icon name="minus" />
                  </Button>
                  <Button size="sm" onClick={() => onZoom('in')} data-testid="timeline-header-zoom-in">
                    <Icon name="plus" />
                  </Button>
                </ButtonGroup>
              )}
              {!isFullscreen && onSetFullscreen && (
                <ExpandButton onClick={() => onSetFullscreen()} iconOnly>
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
  border-bottom: ${(p) => p.theme.border.mediumLight};
  font-size: 0.875rem;
  position: relative;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  width: 100%;
`;

const SettingsRowLeft = styled.div`
  display: flex;
`;

const ExpandButton = styled(Button)`
  height: 2.5rem;
  width: 2.5rem;

  i {
    margin: 0 auto;
  }
`;

export default TaskListingHeader;
