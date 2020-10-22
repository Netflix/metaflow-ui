import { TFunction } from 'i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Step, Task, ForeachStack } from '../../types';
import { formatDuration } from '../../utils/format';
import { getPath } from '../../utils/routing';
import Icon from '../Icon';

type BaseProps = {
  open: boolean;
  grouped: boolean;
  t: TFunction;
};
type TaskRow = { type: 'task'; item: Task } & BaseProps;
type StepRow = { type: 'step'; item: Step; toggle: () => void; duration: number } & BaseProps;
type Props = TaskRow | StepRow;

const TaskListLabel: React.FC<Props> = (props) => {
  const { open, grouped, t } = props;
  return (
    <RowLabel type={props.type} isOpen={open} group={grouped}>
      {props.type === 'task' ? (
        <Link
          to={getPath.task(props.item.flow_id, props.item.run_number, props.item.step_name, props.item.task_id)}
          data-testid="tasklistlabel-link"
        >
          <RowLabelContent>
            <RowLabelTaskName data-testid="tasklistlabel-text">
              <RowStepName>{!grouped ? props.item.step_name : ''}</RowStepName>
              <span>
                {!grouped ? '/' : ''}
                {getTaskLabel(props.item)}
              </span>
            </RowLabelTaskName>
            <RowDuration data-testid="tasklistlabel-duration">
              {props.item.status === 'running'
                ? t('filters.running')
                : props.item.duration
                ? formatDuration(props.item.duration, 1)
                : null}
            </RowDuration>
          </RowLabelContent>
        </Link>
      ) : (
        <StepLabel onClick={() => props.toggle()} data-testid="tasklistlabel-step-container">
          <Icon name="arrowDown" size="xs" rotate={open ? 0 : -90} data-testid="tasklistlabel-open-icon" />
          <RowLabelContent>
            <RowStepName data-testid="tasklistlabel-text">{props.item.step_name}</RowStepName>
            <RowDuration data-testid="tasklistlabel-duration">{formatDuration(props.duration, 1)}</RowDuration>
          </RowLabelContent>
        </StepLabel>
      )}
    </RowLabel>
  );
};

function getTaskLabel(item: Task): string {
  if (item.foreach_stack !== null && item.foreach_stack.length > 0) {
    return getForeachTaskLabel(item.foreach_stack);
  } else {
    return item.task_id;
  }
}

function getForeachTaskLabel(stack: ForeachStack): string {
  // stack format is [['step_name', 'foreach_var', 'foreach_num_tasks', 'foreach_index']]
  return `${stack[0][1]}[${stack[0][3]}]`;
}

export default TaskListLabel;

const RowLabel = styled.div<{ type: 'step' | 'task'; isOpen?: boolean; group?: boolean }>`
  flex: 0 0 245px;
  max-width: 245px;
  overflow: hidden;
  cursor: pointer;
  font-size: ${(p) => (p.type === 'task' ? '12px' : '14px')};
  font-weight: ${(p) => (p.type === 'step' ? '600' : 'normal')};
  font-family: monospace;
  line-height: 27px;

  a {
    display: flex;
    width: 100%;
    color: ${(p) => p.theme.color.text.dark};
    text-decoration: none;
    max-width: 100%;
    padding-left: ${(p) => (p.group ? '2.5rem' : '0rem')};
    white-space: nowrap;

    ${(p) =>
      !p.group
        ? css`
            display: flex;
            justify-content: flex-end;
          `
        : ''}
  }

  i {
    line-height: 0px;
  }
`;

const RowStepName = styled.span`
  overflow: hidden;
`;

const RowDuration = styled.span`
  padding: 0 0.25rem 0 0.5rem;
`;

const RowLabelContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const RowLabelTaskName = styled.div`
  display: flex;
  overflow: hidden;
`;

const StepLabel = styled.div`
  display: flex;
  align-items: center;
  user-select: text;
  font-size: 12px;

  i {
    width: 30px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  > div {
    padding-left: 10px;
  }
`;
