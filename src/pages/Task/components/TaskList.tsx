import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { List } from 'react-virtualized';
import { SearchResultModel } from '../../../hooks/useSearchField';
import { RowDataAction } from '../../../components/Timeline/useRowData';
import TaskListRow from './TaskListRow';
import { Row } from '../../../components/Timeline/VirtualizedTimeline';

//
// Tasklist
//

const HEADER_SIZE_PX = 112;

type Props = {
  rows: Row[];
  rowDataDispatch: (action: RowDataAction) => void;
  activeTaskId: string;
  results: SearchResultModel;
  grouped: boolean;
  paramsString?: string;
};

const TaskList: React.FC<Props> = ({ rows, rowDataDispatch, activeTaskId, results, grouped, paramsString }) => {
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

  const isScrolledOver = ref && ref.current && viewScrollTop + HEADER_SIZE_PX > ref.current.offsetTop;

  return (
    <TaskListContainer ref={ref}>
      <div
        style={
          isScrolledOver
            ? { position: 'fixed', top: HEADER_SIZE_PX + 'px', paddingRight: '0.5rem' }
            : { paddingRight: '0.5rem' }
        }
      >
        {rows.length > 0 && (
          <List
            overscanRowCount={5}
            rowCount={rows.length}
            rowHeight={28}
            rowRenderer={({ index, style }) => {
              const item = rows[index];

              return (
                <TaskListRow
                  key={index}
                  index={index}
                  style={style}
                  item={item}
                  grouped={grouped}
                  paramsString={paramsString}
                  toggle={
                    item.type === 'step'
                      ? () => (item.data ? rowDataDispatch({ type: 'toggle', id: item.data.step_name }) : null)
                      : undefined
                  }
                  active={item.type === 'task' && item.data[0].task_id === activeTaskId}
                  isOpen={item.type === 'step' && item.rowObject.isOpen}
                />
              );
            }}
            height={listSize}
            width={245}
          />
        )}

        {rows.length === 0 && <div style={{ padding: '1rem 0' }}>{t('search.no-results')}</div>}
        {results.status === 'Error' && <div>{t('search.error')}</div>}
      </div>
    </TaskListContainer>
  );
};

const TaskListContainer = styled.div`
  font-size: 12px;
  width: 244px;
  flex-shrink: 0;
`;

export default TaskList;
