import React, { useState, useRef, useEffect } from 'react';
import { Task as ITask } from '../../../types';
import { RowDataModel, StepRowData } from '../../../components/Timeline/useRowData';
import { useHistory } from 'react-router-dom';
import { List } from 'react-virtualized';
import { getPath } from '../../../utils/routing';
import { formatDuration } from '../../../utils/format';
import styled, { css } from 'styled-components';
import Icon from '../../../components/Icon';

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

const TaskList: React.FC<{ rowData: RowDataModel; activeTaskId: number }> = ({ rowData, activeTaskId }) => {
  const [viewScrollTop, setScrollTop] = useState(0);
  const [rows, setRows] = useState<TaskListRowItem[]>([]);
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let taskRows: TaskListRowItem[] = [];
    for (const stepname of Object.keys(rowData)) {
      const step = rowData[stepname];

      taskRows.push({ type: 'step' as const, data: step });
      if (step.isOpen) {
        taskRows = taskRows.concat(
          Object.keys(step.data).map((key) => ({
            type: 'task',
            data: step.data[parseInt(key)][0],
          })),
        );
      }
    }

    setRows(taskRows);
  }, [rowData]);

  useEffect(() => {
    const listener = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, []);

  return (
    <TaskListContainer ref={ref}>
      <List
        style={
          // Adding header height here manually. We need to think it makes sense to have sticky header
          {
            borderTop: '1px solid rgba(0,0,0,0.1)',
            transform: `translateY(${
              ref && ref.current && viewScrollTop + HEADER_SIZE_PX > ref.current.offsetTop
                ? viewScrollTop + HEADER_SIZE_PX - ref.current.offsetTop
                : 0
            }px)`,
          }
        }
        overscanRowCount={5}
        rowCount={rows.length}
        rowHeight={30}
        rowRenderer={({ index, style }) => {
          const item = rows[index];
          const itemDuration = item.type === 'step' ? item.data.duration : item.data.duration;
          return (
            <div
              key={index}
              style={style}
              onClick={() => {
                if (item.type === 'step') {
                } else {
                  history.push(
                    getPath.task(item.data.flow_id, item.data.run_number, item.data.step_name, item.data.task_id),
                  );
                }
              }}
            >
              <RowContainer>
                <RowIconSection rowType={item.type}>
                  {item.type === 'step' ? <Icon name="arrowDown" rotate={-90} size="xs" /> : null}
                </RowIconSection>
                <RowTextContent rowType={item.type} active={item.type === 'task' && item.data.task_id === activeTaskId}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: item.type === 'step' ? 'bold' : 'normal',
                      overflowX: 'hidden',
                    }}
                  >
                    {item.type === 'step' ? item.data.step?.step_name || '' : item.data.task_id}
                  </div>
                  <RowDuration>{itemDuration ? formatDuration(itemDuration, 1) : '-'}</RowDuration>
                </RowTextContent>
              </RowContainer>
            </div>
          );
        }}
        height={window.innerHeight - HEADER_SIZE_PX - 60}
        width={215}
      />
    </TaskListContainer>
  );
};

const TaskListContainer = styled.div`
  font-size: 12px;
  width: 230px;
  padding-right: 15px;
`;

const RowContainer = styled.div`
  display: flex;
`;

const RowTextContent = styled.div<{ rowType: 'step' | 'task'; active?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  line-height: 30px;
  max-width: 185px;
  padding: 0 10px;
  color: #333;
  background: ${(p) => (p.active ? '#E4F0FF' : 'transparent')};
`;

const RowIconSection = styled.div<{ rowType: 'step' | 'task' }>`
  width: 30px;
  line-height: 30px;
  text-align: right;
  color: #717171;
  padding-right: 10px;
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
