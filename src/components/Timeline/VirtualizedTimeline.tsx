import React, { useEffect, useState, useRef } from 'react';
import { List } from 'react-virtualized';
import { Step, Task, AsyncStatus } from '../../types';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';
import TimelineRow from './TimelineRow';
import { GraphHook, GraphState } from './useGraph';
import { StepRowData, RowDataAction } from './useRowData';
import { RowCounts } from './taskdataUtils';
import { useTranslation } from 'react-i18next';
import TimelineFooter from './TimelineFooter';
import FullPageContainer from '../FullPageContainer';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import { ItemRow } from '../Structure';
import { TFunction } from 'i18next';
import Spinner from '../Spinner';
import TaskListingHeader from '../TaskListingHeader';
import TimelineNoRows from './TimelineNoRows';
import { RenderedRows } from 'react-virtualized/dist/es/List';

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
  // Use component size to determine size of virtualised list. It needs fixed size to be able to virtualise.
  const _listContainer = useRef<HTMLDivElement>(null);
  const listContainer = useComponentSize(_listContainer);

  // Position of each step in timeline. Used to track if we should use sticky header (move to rowDataState?)
  const [stepPositions, setStepPositions] = useState<StepIndex[]>([]);
  // Name of sticky header (if should be visible)
  const [stickyHeader, setStickyHeader] = useState<null | string>(null);
  const [showFullscreen, setFullscreen] = useState(false);
  const { graph, dispatch: graphDispatch, setQueryParam } = graphHook;
  const [dragging, setDragging] = useState(false);

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

  //
  // Event handling
  //

  const footerHandleUpdate = (which: 'left' | 'right', to: number) => {
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
  };

  const onRowsRendered = (params: RenderedRows) => {
    const stepNeedsSticky = timelineNeedStickyHeader(stepPositions, params.startIndex);

    if (stepNeedsSticky) {
      setStickyHeader(stepNeedsSticky.name);
    } else {
      if (stickyHeader) {
        setStickyHeader(null);
      }
    }
  };

  const getContainerHeight = () => {
    return (
      (listContainer.height - 69 > rows.length * ROW_HEIGHT ? rows.length * ROW_HEIGHT : listContainer.height - 69) +
      'px'
    );
  };

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
          <ListContainer ref={_listContainer}>
            <FixedListContainer
              sticky={!!stickyHeader && graph.group}
              style={{
                height: getContainerHeight(),
                width: listContainer.width + 'px',
              }}
            >
              <List
                overscanRowCount={10}
                rowCount={rows.length}
                onRowsRendered={onRowsRendered}
                rowHeight={ROW_HEIGHT}
                rowRenderer={createRowRenderer({
                  rows,
                  graph,
                  dispatch: rowDataDispatch,
                  isGrouped: graph.group,
                  paramsString,
                  t: t,
                  dragging: dragging,
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
                  dragging={dragging}
                />
              )}
            </FixedListContainer>

            <TimelineFooter
              graph={graph}
              rows={rows}
              move={(value) => graphDispatch({ type: 'move', value: value })}
              updateHandle={footerHandleUpdate}
              updateDragging={setDragging}
            />
          </ListContainer>
        )}

        {rows.length === 0 && (
          <>
            {status !== 'NotAsked' && status !== 'Loading' && searchField.results.status !== 'Loading' && (
              <TimelineNoRows searchStatus={searchField.results.status} counts={counts} />
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
  dragging: boolean;
};

function getUniqueKey(index: number, row: Row) {
  const key = index + row.type;
  if (row.type === 'step') {
    return key + row.data.step_name;
  } else {
    return key + row.data[0]?.task_id;
  }
}

function rowOnOpen(row: Row, dispatch: (action: RowDataAction) => void) {
  if (row.type === 'step') {
    dispatch({ type: 'toggle', id: row.data.step_name });
  }
}

function createRowRenderer({ rows, graph, dispatch, paramsString = '', isGrouped, t, dragging }: RowRendererProps) {
  return ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    return (
      <div style={style} key={getUniqueKey(index, row)}>
        <TimelineRow
          item={row}
          graph={graph}
          isGrouped={isGrouped}
          isOpen={row.type === 'step' && row.rowObject.isOpen}
          onOpen={() => rowOnOpen(row, dispatch)}
          paramsString={paramsString}
          t={t}
          dragging={dragging}
        />
      </div>
    );
  };
}

const StickyHeader: React.FC<{
  stickyStep: string;
  items: Row[];
  graph: GraphState;
  t: TFunction;
  onToggle: () => void;
  dragging: boolean;
}> = ({ stickyStep, items, graph, onToggle, t, dragging }) => {
  const item = items.find((item) => item.type === 'step' && item.data.step_name === stickyStep);

  if (!item || item.type !== 'step') return null;

  return (
    <TimelineRow
      item={item}
      isOpen={true}
      isGrouped={true}
      graph={graph}
      onOpen={onToggle}
      t={t}
      dragging={dragging}
      sticky
    />
  );
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

const ListContainer = styled.div`
  flex: 1;
  min-height: 500px;
`;

const FixedListContainer = styled.div<{ sticky?: boolean }>`
  position: relative;
  padding-top: ${(p) => (p.sticky ? ROW_HEIGHT : 0)}px;
  transition: 0.5s height;
  overflow: hidden;
`;

//
// Utils
//

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
