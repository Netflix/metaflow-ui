import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List as VirtualList } from 'react-virtualized';
import styled from 'styled-components';
import { AsyncStatus } from '@/types';
import TaskListRow from '@pages/Task/components/TaskListRow';
import Spinner from '@components/Spinner';
import { getStepDuration } from '@components/Timeline/TimelineRow/utils';
import { Row } from '@components/Timeline/VirtualizedTimeline';
import { RowDataAction } from '@components/Timeline/useTaskData';
import { SearchResultModel } from '@hooks/useSearchField';
import { getHeaderSizePx, toRelativeSize } from '@utils/style';
import { getTaskId } from '@utils/task';

//
// Tasklist
//

type Props = {
  rows: Row[];
  rowDataDispatch: (action: RowDataAction) => void;
  taskStatus: AsyncStatus;
  activeTask: string;
  results: SearchResultModel;
  grouped: boolean;
  paramsString?: string;
};

const TaskList: React.FC<Props> = ({
  rows,
  rowDataDispatch,
  taskStatus,
  activeTask,
  results,
  grouped,
  paramsString,
}) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<VirtualList>(null);
  const { t } = useTranslation();

  // Track scroll position so we can recalculate how tall the list should be
  // depending on whether the sticky app header is visible or not.
  useEffect(() => {
    const onScroll = () => setScrollTop(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // When task data changes (e.g. a running task finishes), react-virtualized
  // won't automatically re-render already-visible rows because it caches them.
  // Calling forceUpdateGrid() tells it to throw away that cache and re-render
  // every visible row with the latest data, which is how the status indicator
  // next to each task name stays up to date without needing a page reload.
  useEffect(() => {
    listRef.current?.forceUpdateGrid();
  }, [rows]);

  const listSize = ref?.current
    ? window.innerHeight -
      (viewScrollTop + 25 > ref.current.offsetTop ? getHeaderSizePx() + 25 : ref.current.offsetTop - viewScrollTop + 25)
    : 0;

  // Get the index of the active task so that the list can scroll to it
  const activeIndex = rows.findIndex(
    (item) => item.type === 'task' && item.data[0].step_name + '/' + getTaskId(item.data[0]) === activeTask,
  );

  const rowRenderer = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const item = rows[index];

      return (
        <TaskListRow
          key={index}
          index={index}
          style={style}
          item={item}
          grouped={grouped}
          paramsString={paramsString}
          duration={
            item.type === 'step'
              ? getStepDuration(item.data, item.rowObject.status, item.rowObject.duration)
              : item.data[item.data.length - 1].duration || null
          }
          toggle={
            item.type === 'step'
              ? () => (item.data ? rowDataDispatch({ type: 'toggle', id: item.data.step_name }) : null)
              : undefined
          }
          active={item.type === 'task' && item.data[0].step_name + '/' + getTaskId(item.data[0]) === activeTask}
          isOpen={item.type === 'step' && item.rowObject.isOpen}
        />
      );
    },
    [activeTask, grouped, paramsString, rowDataDispatch, rows],
  );

  return (
    <TaskListContainer ref={ref}>
      <FixedList style={{ position: 'sticky', top: 'var(--layout-application-bar-height)' }}>
        {rows.length > 0 && (
          <VirtualList
            ref={listRef}
            overscanRowCount={5}
            rowCount={rows.length}
            rowHeight={toRelativeSize(28)}
            rowRenderer={rowRenderer}
            height={listSize}
            width={toRelativeSize(245)}
            scrollToIndex={activeIndex}
            scrollToAlignment="center"
          />
        )}

        {/* Search ok, no results */}
        {rows.length === 0 && results.status === 'Ok' && (
          <div style={{ padding: '1rem 0' }}>{t('search.no-results')}</div>
        )}
        {/* Not searched, no more loading, no results -> Not tasks message */}
        {rows.length === 0 && results.status === 'NotAsked' && taskStatus !== 'Loading' && (
          <div style={{ padding: '1rem 0' }}>{t('search.no-tasks')}</div>
        )}
        {/* No rows, still loading more */}
        {rows.length === 0 && taskStatus === 'Loading' && (
          <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner sm />
          </div>
        )}
      </FixedList>
    </TaskListContainer>
  );
};

const TaskListContainer = styled.div`
  padding: var(--task-list-padding);
  width: var(--task-list-width);
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const FixedList = styled.div`
  padding-right: 0.5rem;
`;

export default TaskList;
