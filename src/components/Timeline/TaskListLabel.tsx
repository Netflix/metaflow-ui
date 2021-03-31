import { TFunction } from 'i18next';
import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Step, Task } from '../../types';
import { formatDuration } from '../../utils/format';
import { getPath } from '../../utils/routing';
import { colorByStatus } from '../../utils/style';
import { getTaskDuration, getTaskId } from '../../utils/task';
import Icon from '../Icon';

//
// Typedef
//

type BaseProps = {
  open: boolean;
  grouped: boolean;
  t: TFunction;
  duration: number | null;
  paramsString?: string;
  status: string;
};
type TaskRow = { type: 'task'; item: Task } & BaseProps;
type StepRow = { type: 'step'; item: Step; toggle: () => void } & BaseProps;
type Props = TaskRow | StepRow;

//
// Component
//

const TaskListLabel: React.FC<Props> = (props) => {
  const { open, grouped } = props;

  return (
    <RowLabel type={props.type} isOpen={open} group={grouped} status={props.status}>
      {props.type === 'task' ? (
        <Link
          to={
            getPath.task(
              props.item.flow_id,
              props.item.run_id || props.item.run_number,
              props.item.step_name,
              getTaskId(props.item),
            ) + (props.paramsString ? `?${props.paramsString}` : '')
          }
          data-testid="tasklistlabel-link"
        >
          <RowLabelContent>
            <RowLabelTaskName
              data-testid="tasklistlabel-text"
              title={`${props.item.step_name}/${getTaskLabel(props.item)}`}
            >
              <RowStepName bigName={!grouped && props.item.step_name.length > 12}>
                {!grouped ? props.item.step_name : ''}
              </RowStepName>
              <RowTaskName>
                {!grouped ? '/' : ''}
                {getTaskLabel(props.item)}
              </RowTaskName>
            </RowLabelTaskName>
            <RowDuration data-testid="tasklistlabel-duration">
              {formatDuration(getTaskDuration(props.item), 1)}
            </RowDuration>
          </RowLabelContent>
        </Link>
      ) : (
        <StepLabel onClick={() => props.toggle()} data-testid="tasklistlabel-step-container">
          <Icon name="arrowDown" size="xs" rotate={open ? 0 : -90} data-testid="tasklistlabel-open-icon" />
          <RowLabelContent type="step">
            <RowStepName
              data-testid="tasklistlabel-text"
              bigName={props.item.step_name.length > 20}
              title={props.item.step_name}
            >
              {props.item.step_name}
            </RowStepName>
            <RowDuration data-testid="tasklistlabel-duration">{formatDuration(props.duration, 1)}</RowDuration>
          </RowLabelContent>
        </StepLabel>
      )}
    </RowLabel>
  );
};

function getTaskLabel(item: Task): string {
  return getTaskId(item);
}

export default TaskListLabel;

//
// Style
//

const RowLabel = styled.div<{ type: 'step' | 'task'; isOpen?: boolean; group?: boolean; status: string }>`
  flex: 0 0 15.3125rem;
  max-width: 15.3125rem;
  overflow: hidden;
  cursor: pointer;
  font-size: ${(p) => (p.type === 'task' ? '0.75rem' : '0.875rem')};
  font-weight: ${(p) => (p.type === 'step' ? '600' : 'normal')};
  line-height: 1.6875rem;
  border-left: 2px solid ${(p) => colorByStatus(p.theme, p.status)};
  padding-left: ${(p) => (p.group ? '0' : '0.5rem')};

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

const RowStepName = styled.span<{ bigName: boolean }>`
  max-width: 60%;
  min-width: ${(p) => (p.bigName ? '45%' : 'max-content')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowDuration = styled.span`
  padding: 0 0.25rem 0 0.5rem;
  white-space: nowrap;
`;

const RowLabelContent = styled.div<{ type?: 'step' }>`
  // In case of step row, lets remove icon width from total width so it aligns nicely
  width: ${(p) => (p.type === 'step' ? 'calc(100% - 30px)' : '100%')};
  display: flex;
  justify-content: space-between;
`;

const RowLabelTaskName = styled.div`
  display: flex;
  overflow: hidden;
`;

const RowTaskName = styled.div`
  overflow: hidden;

  text-overflow: ellipsis;
`;

const StepLabel = styled.div`
  display: flex;
  align-items: center;
  user-select: text;
  font-size: 0.75rem;

  i {
    width: 1.875rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  > div {
    padding-left: 0.625rem;
  }
`;
