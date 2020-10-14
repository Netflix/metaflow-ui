import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { createTask, createStep } from '../testhelper';
import TestWrapper from '../../../utils/testing';
import TaskListLabel from '../TaskListLabel';

const MockT = (str: string) => str;

const BASE_PROPS = {
  open: true,
  groupped: true,
  t: MockT,
};

describe('TaskListLabel component', () => {
  test('<TaskListLabel> - should render', () => {
    render(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({})} {...BASE_PROPS} />
      </TestWrapper>,
    );
  });

  test('<TaskListLabel> - Task when grouping', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({ duration: 1100 })} {...BASE_PROPS} />
      </TestWrapper>,
    );

    expect(getByTestId('tasklistlabel-text').textContent).toBe('1');
    expect(getByTestId('tasklistlabel-link')).toHaveAttribute('href', '/BasicFlow/1/askel/1');
    expect(getByTestId('tasklistlabel-duration').textContent).toBe('1.1s');
  });

  test('<TaskListLabel> - Task when not grouping', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TaskListLabel type="task" item={createTask({})} {...BASE_PROPS} groupped={false} />
      </TestWrapper>,
    );

    expect(getByTestId('tasklistlabel-text').textContent).toBe('askel/1');
  });

  test('<TaskListLabel> - Step', () => {
    const TOGGLE_FN = jest.fn();

    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TaskListLabel type="step" item={createStep({})} {...BASE_PROPS} duration={1200} toggle={TOGGLE_FN} />
      </TestWrapper>,
    );

    expect(getByTestId('tasklistlabel-text').textContent).toBe('askel');
    expect(getByTestId('tasklistlabel-open-icon').attributes.getNamedItem('rotate')?.value).toBe('0');
    expect(getByTestId('tasklistlabel-duration').textContent).toBe('1.2s');

    rerender(
      <TestWrapper>
        <TaskListLabel
          type="step"
          item={createStep({})}
          {...BASE_PROPS}
          duration={1200}
          open={false}
          toggle={TOGGLE_FN}
        />
      </TestWrapper>,
    );

    expect(getByTestId('tasklistlabel-open-icon').attributes.getNamedItem('rotate')?.value).toBe('-90');

    fireEvent.click(getByTestId('tasklistlabel-step-container'));

    expect(TOGGLE_FN).toBeCalledTimes(1);
  });
});
