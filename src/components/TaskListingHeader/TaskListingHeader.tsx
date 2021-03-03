import React from 'react';
import { GraphState, GraphHook, GraphMode } from '../Timeline/useGraph';
import { ItemRow } from '../Structure';
import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import styled from 'styled-components';
import Icon from '../Icon';
import { useTranslation } from 'react-i18next';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
// import SearchField from '../SearchField';
import CollapseButton from './components/CollapseButton';
import { RowCounts } from '../Timeline/taskdataUtils';
import CustomSettings from './components/CustomSettings';
import ModeSelector from './components/ModeSelector';

//
// Typedef
//

export type TaskListingProps = {
  expandAll: () => void;
  collapseAll: () => void;
  setFullscreen?: () => void;
  isFullscreen?: boolean;
  enableZoomControl?: boolean;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
  isAnyGroupOpen: boolean;
  hasStepFilter?: boolean;
  resetSteps?: () => void;
};

//
// Component
//

const TaskListingHeader: React.FC<TaskListingProps> = ({
  graph: graphHook,
  expandAll,
  collapseAll,
  isFullscreen,
  setFullscreen,
  // searchField,
  counts,
  enableZoomControl = false,
  isAnyGroupOpen,
  // hasStepFilter,
  // resetSteps,
}) => {
  const { t } = useTranslation();
  const { graph, setQueryParam } = graphHook;
  const activeMode = getMode(graph);

  return (
    <TaskListingContainer>
      <ModeSelector activeMode={activeMode} select={(newMode) => graphHook.setMode(newMode)} />

      <SettingsRow>
        <SettingsRowLeft>
          <CollapseButton
            disabled={!graph.group}
            expand={() => expandAll()}
            collapse={() => collapseAll()}
            isAnyGroupOpen={isAnyGroupOpen}
          />
          {/* 
            <SearchField
              initialValue={searchField.fieldProps.text}
              onUpdate={searchField.fieldProps.setText}
              status={searchField.results.status}
            /> */}

          <CustomSettings
            updateSort={(order, direction) => setQueryParam({ order, direction }, 'replaceIn')}
            updateStatusFilter={(status: null | string) => setQueryParam({ status })}
            updateGroupBy={(group) => setQueryParam({ group: group ? 'true' : 'false' }, 'replaceIn')}
            graph={graph}
            counts={counts}
          />
        </SettingsRowLeft>
        <div>
          {enableZoomControl && setFullscreen && (
            <ItemRow noWidth>
              <ButtonGroup big>
                <Button
                  size="sm"
                  onClick={() => graphHook.dispatch({ type: 'resetZoom' })}
                  active={!graph.controlled}
                  data-testid="timeline-header-zoom-fit"
                >
                  <span style={{ fontSize: '0.875rem' }}>{t('timeline.fit-to-screen')}</span>
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
                <ExpandButton onClick={() => setFullscreen()} iconOnly>
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

export function getMode(graph: GraphState): GraphMode {
  if (graph.isCustomEnabled) {
    return 'custom';
  } else if (graph.group === true && !graph.statusFilter && graph.sortBy === 'startTime' && graph.sortDir === 'asc') {
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

//
// Style
//

const TaskListingContainer = styled.div`
  border-bottom: ${(p) => p.theme.border.mediumLight};
  font-size: 14px;
  position: relative;
`;

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  width: 100%;
`;

const SettingsRowLeft = styled.div`
  display: flex;
`;

const ExpandButton = styled(Button)`
  height: 36px;
  width: 36px;

  i {
    margin: 0 auto;
  }
`;

export default TaskListingHeader;
