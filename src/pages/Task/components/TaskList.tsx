import React, { useState, useRef, useEffect } from 'react';
import { Task as ITask } from '../../../types';
import { RowDataAction, RowDataModel, StepRowData } from '../../../components/Timeline/useRowData';
import { useHistory } from 'react-router-dom';
import { List } from 'react-virtualized';
import { getPath } from '../../../utils/routing';
import { formatDuration } from '../../../utils/format';
import styled, { css } from 'styled-components';
import Icon from '../../../components/Icon';
import { useTranslation } from 'react-i18next';
import { SearchFieldProps, SearchResultModel } from '../../../hooks/useSearchField';
import SearchField from '../../../components/SearchField';
import SettingsButton from '../../../components/Timeline/SettingsButton';

//
// Tasklist
// TODO FIX ELEMENT HEIGHT SO ITS ALWAYS SCREEN SIZE MAX
//

type TaskListRowItem =
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

type TaskListStepData = {
  isOpen: boolean;
};

type Props = {
  rowData: RowDataModel;
  rowDataDispatch: (action: RowDataAction) => void;
  activeTaskId: number;
  results: SearchResultModel;
  searchFieldProps: SearchFieldProps;
};

const TaskList: React.FC<Props> = ({ rowData, rowDataDispatch, activeTaskId, results, searchFieldProps }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const [rows, setRows] = useState<TaskListRowItem[]>([]);
  const [stepData, setStepData] = useState<Record<string, TaskListStepData>>({});
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let taskRows: TaskListRowItem[] = [];
    const matchIds = results.result.map((item) => item.task_id);

    for (const stepname of Object.keys(rowData)) {
      const step = rowData[stepname];
      if (!stepname.startsWith('_')) {
        let newRows: TaskListRowItem[] = [];
        const isOpen = stepData[stepname] ? stepData[stepname].isOpen : step.isOpen;

        // Add new rows if step is open
        newRows = Object.keys(step.data)
          .filter((key) => results.status === 'NotAsked' || matchIds.indexOf(parseInt(key)) > -1)
          .filter((key) => step.data[parseInt(key)] && step.data[parseInt(key)].length > 0)
          .map((key) => ({
            type: 'task',
            data: step.data[parseInt(key)][0],
          }));

        // Only add step row if there was tasks. Should we check if we have filter active?
        if (newRows.length > 0) {
          if (isOpen) {
            taskRows = taskRows.concat([{ type: 'step' as const, data: step }], newRows);
          } else {
            taskRows = taskRows.concat([{ type: 'step' as const, data: step }]);
          }
        }
      }
    }

    setRows(taskRows);
  }, [rowData, stepData, results]);

  useEffect(() => {
    setStepData(
      Object.keys(rowData).reduce((obj, key) => {
        if (stepData[key]) {
          return obj;
        }
        return { ...obj, [key]: { isOpen: true } };
      }, {}),
    );
  }, [rowData]); // eslint-disable-line

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
            ? { position: 'fixed', top: HEADER_SIZE_PX + 'px', paddingRight: '0.75rem' }
            : { paddingRight: '0.75rem' }
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
            groupBy={'step'}
            toggleGroupBy={() => null}
          />
        </TaskListInputContainer>

        {rows.length > 0 && (
          <List
            style={
              // Adding header height here manually.
              {
                borderTop: '1px solid rgba(0,0,0,0.1)',
              }
            }
            overscanRowCount={5}
            rowCount={rows.length}
            rowHeight={28}
            rowRenderer={({ index, style }) => {
              const item = rows[index];
              const itemDuration = item.type === 'step' ? item.data.duration : item.data.duration;
              return (
                <div
                  key={index}
                  style={style}
                  onClick={() => {
                    if (item.type === 'step') {
                      if (item.data.step) {
                        const sname = item.data.step.step_name;
                        setStepData({
                          ...stepData,
                          [sname]: { isOpen: stepData[sname] ? !stepData[sname].isOpen : true },
                        });
                      }
                    } else {
                      history.push(
                        getPath.task(item.data.flow_id, item.data.run_number, item.data.step_name, item.data.task_id),
                      );
                    }
                  }}
                >
                  <RowContainer>
                    <RowIconSection rowType={item.type}>
                      {item.type === 'step' ? (
                        <Icon
                          name="arrowDown"
                          rotate={
                            item.data.step &&
                            stepData[item.data.step.step_name] &&
                            !stepData[item.data.step.step_name].isOpen
                              ? -90
                              : 0
                          }
                          size="xs"
                        />
                      ) : null}
                    </RowIconSection>
                    <RowTextContent
                      rowType={item.type}
                      active={item.type === 'task' && item.data.task_id === activeTaskId}
                    >
                      <RowMainLabel itemType={item.type}>
                        {item.type === 'step' ? item.data.step?.step_name || '' : item.data.task_id}
                      </RowMainLabel>
                      <RowDuration>{itemDuration ? formatDuration(itemDuration, 1) : '-'}</RowDuration>
                    </RowTextContent>
                  </RowContainer>
                </div>
              );
            }}
            height={listSize}
            width={230}
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
  width: 245px;
  flex-shrink: 0;
`;

const TaskListInputContainer = styled.div`
  display: flex;
  height: 40px;
  align-items: center;

  .field-text {
    width: 100%;
  }
`;

const RowContainer = styled.div`
  display: flex;
  cursor: pointer;
`;

const RowMainLabel = styled.div<{ itemType: string }>`
  font-family: monospace;
  font-weight: ${(p) => (p.itemType === 'step' ? 'bold' : 'normal')};
  overflow-x: hidden;
`;

const RowTextContent = styled.div<{ rowType: 'step' | 'task'; active?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  line-height: 27px;
  max-width: 200px;
  padding: 0 10px;
  color: #333;
  background: ${(p) => (p.active ? '#E4F0FF' : 'transparent')};
`;

const RowIconSection = styled.div<{ rowType: 'step' | 'task' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  color: #717171;
  flex-shrink: 0;
  ${(p) =>
    p.rowType === 'step'
      ? css`
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        `
      : ''}
`;

const RowDuration = styled.div`
  min-width: 50px;
  text-align: right;
  white-space: nowrap;
  padding-left: 0.5rem;
  color: #666;
`;

export default TaskList;
