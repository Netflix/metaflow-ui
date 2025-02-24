import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { List } from 'react-virtualized';
import { SearchResultModel } from '../../../hooks/useSearchField';
import { RowDataAction } from '../../../components/Timeline/useTaskData';
import TaskListRow from './TaskListRow';
import { Row } from '../../../components/Timeline/VirtualizedTimeline';
import { HEADER_SIZE_PX } from '../../../constants';
import { getTaskId } from '../../../utils/task';
import { AsyncStatus } from '../../../types';
import Spinner from '../../../components/Spinner';
import { getStepDuration } from '../../../components/Timeline/TimelineRow/utils';
import { toRelativeSize } from '../../../utils/style';

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
  const { t } = useTranslation();

  useEffect(() => {
    const listener = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, []);

  const listSize = ref?.current
    ? window.innerHeight -
      (viewScrollTop + 25 > ref.current.offsetTop ? HEADER_SIZE_PX + 25 : ref.current.offsetTop - viewScrollTop + 25)
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
          <List
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
