import React, { useEffect, useState, createRef, useRef } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, AsyncStatus } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import TimelineRow from './TimelineRow';
import { GraphHook, GraphState, GraphSortBy } from './useGraph';
import { StepRowData, RowDataAction, RowDataModel } from './useRowData';
import { RowCounts } from './taskdataUtils';
import { useTranslation } from 'react-i18next';
import TimelineFooter from './TimelineFooter';
import FullPageContainer from '../FullPageContainer';
import { SearchFieldReturnType, SearchResultModel } from '../../hooks/useSearchField';
import GenericError from '../GenericError';
import { ItemRow } from '../Structure';
import { TFunction } from 'i18next';
import Spinner from '../Spinner';
import TaskListingHeader from '../TaskListingHeader';
import FEATURE_FLAGS from '../../FEATURE';

export const ROW_HEIGHT = 28;
export type StepRow = { type: 'step'; data: Step; rowObject: StepRowData };
export type TaskRow = { type: 'task'; data: Task[] };
export type Row = StepRow | TaskRow;
type StepIndex = { name: string; index: number };

//
// Self containing component for rendering everything related to timeline. Component fetched (and subscribes for live events) steps and tasks from different
// endpoints. View is supposed to be full page (and full page only) since component itself will use virtualised scrolling.
//
type TimelineProps = {
  rows: Row[];
  rowDataDispatch: React.Dispatch<RowDataAction>;
  status: AsyncStatus;
  counts: RowCounts;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  paramsString: string;
  isAnyGroupOpen: boolean;
};

const VirtualizedTimeline: React.FC<TimelineProps> = ({
  graph: graphHook,
  rows,
  rowDataDispatch,
  status,
  counts,
  searchField,
  paramsString,
  isAnyGroupOpen,
}) => {
  const { t } = useTranslation();
  const _listref = createRef<List>();
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef<HTMLDivElement>(null);
  const listContainer = useComponentSize(_listContainer);

  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  const [showFullscreen, setFullscreen] = useState(false);
  const { graph, dispatch: graphDispatch, setQueryParam } = graphHook;

  // Update step position indexes (for sticky headers). We might wanna do this else where
  useEffect(() => {
    const stepPos: StepIndex[] = [];
    let index = 0;

    for (const current of rows) {
      index++;
      if (current.type === 'step') {
        stepPos.push({ name: current.data.step_name, index });
      }
    }

    setStepPositions(stepPos);
  }, [rows]);

  const content = (
    <VirtualizedTimelineContainer style={showFullscreen ? { padding: '0 1rem' } : {}}>
      <VirtualizedTimelineSubContainer>
        <TaskListingHeader
          graph={graphHook}
          expandAll={() => rowDataDispatch({ type: 'openAll' })}
          collapseAll={() => rowDataDispatch({ type: 'closeAll' })}
          setFullscreen={() => setFullscreen(true)}
          isFullscreen={showFullscreen}
          searchField={searchField}
          counts={counts}
          enableZoomControl
          isAnyGroupOpen={isAnyGroupOpen}
          hasStepFilter={graph.stepFilter.length > 0}
          resetSteps={() => setQueryParam({ steps: null })}
        />
        {rows.length > 0 && (
          <div style={{ flex: '1', minHeight: '500px' }} ref={_listContainer}>
            <FixedListContainer
              sticky={!!stickyHeader && graph.group}
              style={{
                height:
                  (listContainer.height - 69 > rows.length * ROW_HEIGHT
                    ? rows.length * ROW_HEIGHT
                    : listContainer.height - 69) + 'px',
                width: listContainer.width + 'px',
              }}
            >
              <List
                // eslint-disable-next-line react/no-string-refs
                ref={_listref}
                overscanRowCount={10}
                rowCount={rows.length}
                onRowsRendered={(params) => {
                  const stepNeedsSticky = timelineNeedStickyHeader(stepPositions, params.startIndex);

                  if (stepNeedsSticky) {
                    setStickyHeader(stepNeedsSticky.name);
                  } else {
                    if (stickyHeader) {
                      setStickyHeader(null);
                    }
                  }
                }}
                rowHeight={ROW_HEIGHT}
                rowRenderer={createRowRenderer({
                  rows,
                  graph,
                  dispatch: rowDataDispatch,
                  isGrouped: graph.group,
                  paramsString,
                  t: t,
                })}
                height={listContainer.height - (stickyHeader ? ROW_HEIGHT : 0) - 69}
                width={listContainer.width}
              />

              {stickyHeader && graph.group && (
                <StickyHeader
                  stickyStep={stickyHeader}
                  items={rows}
                  graph={graph}
                  onToggle={() => rowDataDispatch({ type: 'close', id: stickyHeader })}
                  t={t}
                />
              )}
            </FixedListContainer>

            {FEATURE_FLAGS.TIMELINE_MINIMAP && (
              <TimelineFooter
                graph={graph}
                rows={rows}
                move={(value) => graphDispatch({ type: 'move', value: value })}
                updateHandle={(which, to) => {
                  if (which === 'left') {
                    graphDispatch({
                      type: 'setZoom',
                      start: to < graph.min ? graph.min : to > graph.timelineEnd - 500 ? graph.timelineStart : to,
                      end: graph.timelineEnd,
                    });
                  } else {
                    graphDispatch({
                      type: 'setZoom',
                      start: graph.timelineStart,
                      end: to > graph.max ? graph.max : to < graph.timelineStart + 500 ? graph.timelineEnd : to,
                    });
                  }
                }}
              />
            )}
          </div>
        )}

        {rows.length === 0 && (
          <>
            {status !== 'NotAsked' && status !== 'Loading' && searchField.results.status !== 'Loading' && (
              <NoRowsContainer searchStatus={searchField.results.status} counts={counts} />
            )}

            {(status === 'Loading' || searchField.results.status === 'Loading') && (
              <ItemRow justify="center" margin="lg">
                <Spinner md />
              </ItemRow>
            )}
          </>
        )}
      </VirtualizedTimelineSubContainer>
    </VirtualizedTimelineContainer>
  );

  return showFullscreen ? (
    <FullPageContainer onClose={() => setFullscreen(false)}>{content}</FullPageContainer>
  ) : (
    content
  );
};

type RowRendererProps = {
  rows: Row[];
  graph: GraphState;
  dispatch: (action: RowDataAction) => void;
  isGrouped: boolean;
  paramsString: string;
  t: TFunction;
};

function createRowRenderer({ rows, graph, dispatch, paramsString = '', isGrouped, t }: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <div style={style} key={index}>
        <TimelineRow
          item={row}
          graph={graph}
          isGrouped={isGrouped}
          isOpen={row.type === 'step' && row.rowObject.isOpen}
          onOpen={() => (row.type === 'step' ? dispatch({ type: 'toggle', id: row.data.step_name }) : () => null)}
          paramsString={paramsString}
          t={t}
        />
      </div>
    );
  };
}

const NoRowsContainer: React.FC<{ counts: RowCounts; searchStatus: AsyncStatus }> = ({ counts, searchStatus }) => {
  const { t } = useTranslation();

  const errorProps =
    searchStatus === 'NotAsked'
      ? { message: t('timeline.no-rows'), icon: 'listNotFound' as const }
      : { message: t('search.no-results'), icon: 'searchNotFound' as const };

  return (
    <ItemRow justify="center" margin="lg">
      <div>
        <GenericError {...errorProps} />
        {counts.all > 0 && <ItemRow margin="md">{`${counts.all} ${t('timeline.hidden-by-settings')}`}</ItemRow>}
      </div>
    </ItemRow>
  );
};

const StickyHeader: React.FC<{
  stickyStep: string;
  items: Row[];
  graph: GraphState;
  t: TFunction;
  onToggle: () => void;
}> = ({ stickyStep, items, graph, onToggle, t }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item || item.type !== 'step') return null;

  return <TimelineRow item={item} isOpen={true} isGrouped={true} graph={graph} onOpen={onToggle} t={t} sticky />;
};

const VirtualizedTimelineContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
`;

const VirtualizedTimelineSubContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FixedListContainer = styled.div<{ sticky?: boolean }>`
  position: relative;
  padding-top: ${(p) => (p.sticky ? ROW_HEIGHT : 0)}px;
`;

//
// Utils
//

function getRowStartTime(row: Row): number {
  if (row.type === 'task') {
    return row.data[0].started_at || row.data[0].ts_epoch;
  }
  return 0;
}

function getRowFinishedTime(row: Row): number {
  if (row.type === 'task') {
    const lastTask = row.data[row.data.length - 1];
    return lastTask ? lastTask.finished_at || lastTask.ts_epoch : 0;
  }
  return 0;
}

export function sortRows(sortBy: GraphSortBy, sortDir: 'asc' | 'desc'): (a: Row, b: Row) => number {
  return (a: Row, b: Row) => {
    const fst = sortDir === 'asc' ? a : b;
    const snd = sortDir === 'asc' ? b : a;

    if (sortBy === 'startTime' && fst.type === 'task' && snd.type === 'task') {
      return getRowStartTime(fst) - getRowStartTime(snd);
    }
    if (sortBy === 'endTime' && fst.type === 'task' && snd.type === 'task') {
      return getRowFinishedTime(fst) - getRowFinishedTime(snd);
    } else if (sortBy === 'duration') {
      return taskDuration(fst) - taskDuration(snd);
    }

    return 0;
  };
}

function taskDuration(a: Row): number {
  if (a.type === 'task') {
    return getRowFinishedTime(a) - getRowStartTime(a);
  }
  return 0;
}

function shouldApplySearchFilter(results: SearchResultModel) {
  return results.status !== 'NotAsked';
}

export function makeVisibleRows(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: string[],
  searchResults: SearchResultModel,
): Row[] {
  const matchIds = searchResults.result.map((item) => item.task_id);

  return visibleSteps.reduce((arr: Row[], currentStepName: string): Row[] => {
    const rowData = rowDataState[currentStepName];

    if (!rowData) return arr;

    // If step row is open, add its tasks to the list.
    let rowTasks = Object.keys(rowData.data).map((item) => ({
      type: 'task' as const,
      data: rowData.data[item],
    }));

    if (graph.statusFilter) {
      rowTasks = rowTasks.filter(
        (item) =>
          (graph.statusFilter === 'failed' && item.data.length > 1) ||
          item.data.find((task) => task.status === graph.statusFilter),
      );
    }

    if (shouldApplySearchFilter(searchResults)) {
      rowTasks = rowTasks.filter((item) => matchIds.indexOf(item.data[0]?.task_id?.toString()) > -1);
    }

    return rowTasks.length === 0
      ? arr
      : arr.concat(
          graph.group && rowData.step ? [{ type: 'step' as const, data: rowData.step, rowObject: rowData }] : [],
          rowData.isOpen || !graph.group
            ? graph.group
              ? rowTasks.sort(sortRows(graph.sortBy, graph.sortDir))
              : rowTasks
            : [],
        );
  }, []);
}

function timelineNeedStickyHeader(stepPositions: StepIndex[], currentIndex: number) {
  return stepPositions.find((item, index) => {
    const isLast = index + 1 === stepPositions.length;

    if (item.index < currentIndex && (isLast || stepPositions[index + 1].index > currentIndex + 1)) {
      return true;
    }
    return false;
  });
}

export default VirtualizedTimeline;
