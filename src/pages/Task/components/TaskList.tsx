import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { List } from 'react-virtualized';
import { Task as ITask } from '../../../types';
import { SearchFieldProps, SearchResultModel } from '../../../hooks/useSearchField';
import { RowDataAction, RowDataModel, StepRowData } from '../../../components/Timeline/useRowData';
import SettingsButton from '../../../components/Timeline/SettingsButton';
import SearchField from '../../../components/SearchField';
import TaskListRow from './TaskListRow';

//
// Tasklist
//

export type TaskListRowItem =
  | {
      type: 'task';
      data: ITask;
    }
  | {
      type: 'step';
      data: StepRowData;
    };

const HEADER_SIZE_PX = 112;
const SEARCH_SIZE_PX = 40;

type Props = {
  rowData: RowDataModel;
  rowDataDispatch: (action: RowDataAction) => void;
  activeTaskId: string;
  results: SearchResultModel;
  searchFieldProps: SearchFieldProps;
  groupBy: { value: boolean; set: (val: boolean) => void };
};

const TaskList: React.FC<Props> = ({ rowData, rowDataDispatch, activeTaskId, results, searchFieldProps, groupBy }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const [rows, setRows] = useState<TaskListRowItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let taskRows: TaskListRowItem[] = [];
    const matchIds = results.result.map((item) => item.task_id);

    for (const stepname of Object.keys(rowData)) {
      const step = rowData[stepname];
      // Filter out steps that starts with _ since those are not interesting for user
      if (!stepname.startsWith('_')) {
        let newRows: TaskListRowItem[] = [];
        const isOpen = step.isOpen;

        // Add new rows if step is open
        newRows = Object.keys(step.data)
          .filter((key) => results.status === 'NotAsked' || matchIds.indexOf(key) > -1)
          .filter((key) => step.data[key] && step.data[key].length > 0)
          .map((key) => ({
            type: 'task',
            data: step.data[key][0],
          }));

        // Only add step row if there was tasks. Should we check if we have filter active?
        if (newRows.length > 0) {
          const stepRow = groupBy.value ? [{ type: 'step' as const, data: step }] : [];
          if (isOpen) {
            taskRows = taskRows.concat(stepRow, newRows);
          } else {
            taskRows = taskRows.concat(stepRow);
          }
        }
      }
    }

    setRows(taskRows);
  }, [rowData, results, groupBy]);

  useEffect(() => {
    const listener = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, []);

  const listSize = ref?.current
    ? window.innerHeight -
      (viewScrollTop + 25 > ref.current.offsetTop ? HEADER_SIZE_PX + 25 : ref.current.offsetTop - viewScrollTop + 25) -
      SEARCH_SIZE_PX
    : 0;

  const isScrolledOver = ref && ref.current && viewScrollTop + HEADER_SIZE_PX > ref.current.offsetTop;

  //
  // Button behaviour
  //

  const expandAll = () => {
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'open', id: stepName });
    });
  };

  const collapseAll = () => {
    Object.keys(rowData).forEach((stepName) => {
      rowDataDispatch({ type: 'close', id: stepName });
    });
  };

  return (
    <TaskListContainer ref={ref}>
      <div
        style={
          isScrolledOver
            ? { position: 'fixed', top: HEADER_SIZE_PX + 'px', paddingRight: '0.5rem' }
            : { paddingRight: '0.5rem' }
        }
      >
        <TaskListInputContainer>
          <SearchField
            initialValue={searchFieldProps.text}
            onUpdate={searchFieldProps.setText}
            status={results.status}
          />
          <SettingsButton
            expand={() => expandAll()}
            collapse={() => collapseAll()}
            groupBy={groupBy.value}
            toggleGroupBy={(value) => groupBy.set(value)}
          />
        </TaskListInputContainer>

        {rows.length > 0 && (
          <List
            style={
              // Adding header height here manually.
              {
                borderTop: '2px solid rgba(0,0,0,0.1)',
              }
            }
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
                  toggle={
                    item.type === 'step' && item.data.step
                      ? () =>
                          item.data.step ? rowDataDispatch({ type: 'toggle', id: item.data.step.step_name }) : null
                      : undefined
                  }
                  active={item.type === 'task' && item.data.task_id === activeTaskId}
                  isOpen={
                    item.type === 'step' &&
                    item.data.step &&
                    rowData[item.data.step.step_name] &&
                    !rowData[item.data.step.step_name].isOpen
                  }
                />
              );
            }}
            height={listSize}
            width={245}
          />
        )}

        {results.status === 'Ok' && rows.length === 0 && <div>{t('search.no-results')}</div>}
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

const TaskListInputContainer = styled.div`
  display: flex;
  height: 66px;
  align-items: center;

  .field-text {
    width: 100%;
  }
`;

export default TaskList;
