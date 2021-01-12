import React from 'react';
import { GraphState, GraphHook } from '../Timeline/useGraph';
import { ItemRow } from '../Structure';
import { Text } from '../Text';
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
  searchField,
  counts,
  enableZoomControl = false,
  isAnyGroupOpen,
  hasStepFilter,
  resetSteps,
}) => {
  const { t } = useTranslation();
  const { graph, setQueryParam } = graphHook;
  const activeMode = getMode(graph);

  return (
    <TaskListingContainer>
      <THeader>
        <THeaderLeft>
          <THeaderLeftTop>
            <CollapseButton
              disabled={!graph.group}
              expand={() => expandAll()}
              collapse={() => collapseAll()}
              isAnyGroupOpen={isAnyGroupOpen}
            />

            <SearchField
              initialValue={searchField.fieldProps.text}
              onUpdate={searchField.fieldProps.setText}
              status={searchField.results.status}
            />
          </THeaderLeftTop>
          <THeaderLeftBottom>
            {hasStepFilter && (
              <Button withIcon="left" onClick={() => resetSteps && resetSteps()}>
                <Icon name="timeline" size="md" padRight />
                <span>{t('timeline.show-all-steps')}</span>
              </Button>
            )}
          </THeaderLeftBottom>
        </THeaderLeft>
        <THeaderRight>
          <THeaderRightTop>
            <ModeSelector activeMode={activeMode} select={(newMode) => graphHook.setMode(newMode)} />

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
          </THeaderRightTop>
          <THeaderRightBottom>
            <CustomSettings
              updateSortBy={(by) => setQueryParam({ order: by }, 'replaceIn')}
              updateSortDir={() => setQueryParam({ direction: graph.sortDir === 'asc' ? 'desc' : 'asc' }, 'replaceIn')}
              updateStatusFilter={(status: null | string) => setQueryParam({ status })}
              updateGroupBy={(group) => setQueryParam({ group: group ? 'true' : 'false' }, 'replaceIn')}
              graph={graph}
              counts={counts}
            />
          </THeaderRightBottom>
        </THeaderRight>
      </THeader>
    </TaskListingContainer>
  );
};

//
// Utils
//

function getMode(graph: GraphState) {
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

const THeader = styled.div`
  display: flex;

  .field.field-checkbox {
    margin-bottom: 0;
  }
`;

const THeaderLeft = styled.div``;

const THeaderLeftTop = styled.div`
  display: flex;
  justify-content: space-between;

  padding: ${(p) => `0 ${p.theme.spacer.sm}rem 0 0`};
  width: 245px;

  .field-text {
    font-size: 12px;
    width: 100%;
    height: 36px;

    input {
      height: 36px;
    }
  }
`;

const THeaderLeftBottom = styled.div`
  padding-top: 0.75rem;
  padding-right: 0.5rem;
  button {
    justify-content: center;
    font-size: 0.875rem;
    height: 28px;
    width: 100%;
  }
`;

const THeaderRight = styled.div`
  flex: 1;
  justify-content: space-between;
`;

const THeaderRightTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const THeaderRightBottom = styled.div`
  display: inline-block;
  height: 34px;
  padding-left: 1rem;
  padding-right: 1rem;
  background: ${(p) => p.theme.color.bg.light};
  border: 1px solid #e9e9e9;
  margin: 0 0 0.25rem;
  border-radius: 0.25rem;
`;

export default TaskListingHeader;
