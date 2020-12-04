import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { createMetadata, createResource, createTask } from '../../../utils/testhelper';
import TaskDetails, { getAttemptStartTime, getAttemptDuration } from '../components/TaskDetails';
import TestWrapper from '../../../utils/testing';

describe('TaskDetails component', () => {
  test('<TaskDetails /> - Metadata', () => {
    const props = {
      task: createTask({}),
      attempts: [createTask({})],
      metadata: createResource([createMetadata({ field_name: 'somedata', value: 'yep' })], {}),
    };

    // Ok state
    const { getByTestId, rerender } = render(
      <TestWrapper>
        <TaskDetails {...props} />
      </TestWrapper>,
    );

    fireEvent.click(getByTestId('task-expand-button').children[0]);
    expect(getByTestId('task-metadata')).toBeInTheDocument();
    expect(getByTestId('task-metadata-ok')).toBeInTheDocument();

    // Loading state
    rerender(
      <TestWrapper>
        <TaskDetails {...props} metadata={{ ...props.metadata, status: 'Loading' }} />
      </TestWrapper>,
    );
    expect(getByTestId('task-metadata-loading')).toBeInTheDocument();
    // Error state
    rerender(
      <TestWrapper>
        <TaskDetails {...props} metadata={{ ...props.metadata, status: 'Error' }} />
      </TestWrapper>,
    );
    expect(getByTestId('task-metadata-error')).toBeInTheDocument();
  });

  test('Util - getAttemptDuration', () => {
    // No attempts, no duration -> return empty string
    expect(getAttemptDuration([], createTask({ duration: undefined }))).toBe('');
    // No attempts, task with duration -> return own duration
    expect(getAttemptDuration([], createTask({ duration: 500 }))).toBe('0.5s');

    // If attempt has no started_at, has duration BUT earlier attempt doesn't have duration -> return own duration
    const tarray = [createTask({ attempt_id: 0, duration: undefined }), createTask({ attempt_id: 1, duration: 500 })];
    expect(getAttemptDuration(tarray, tarray[1])).toBe('0.5s');

    // If attempt has no started_at, but has duration we cannot trust duration -> return attempt.duration - previoustask.duration
    const tarray2 = [createTask({ attempt_id: 0, duration: 300 }), createTask({ attempt_id: 1, duration: 500 })];
    expect(getAttemptDuration(tarray2, tarray2[1])).toBe('0.2s');

    // If attempt has started_at we can trust its duration -> return own duration
    const tarray3 = [
      createTask({ attempt_id: 0, duration: 300 }),
      createTask({ attempt_id: 1, started_at: 10, duration: 500 }),
    ];
    expect(getAttemptDuration(tarray3, tarray3[1])).toBe('0.5s');
  });

  test('Util - getAttemptStartTime', () => {
    // Without tasks array
    expect(getAttemptStartTime(null, createTask({ ts_epoch: 10 }))).toBe(10);
    expect(getAttemptStartTime(null, createTask({ ts_epoch: 10, started_at: 20 }))).toBe(20);

    const attempts = [
      createTask({ attempt_id: 0, ts_epoch: 10, finished_at: 20 }),
      createTask({ attempt_id: 1, ts_epoch: 10 }),
    ];
    // Return ts_epoch of first
    expect(getAttemptStartTime(attempts, attempts[0])).toBe(10);
    // Returns finish time of previous task since ts_epoch is same as on first one
    expect(getAttemptStartTime(attempts, attempts[1])).toBe(20);

    const attempts2 = [
      createTask({ attempt_id: 0, ts_epoch: 10, finished_at: 20 }),
      createTask({ attempt_id: 1, ts_epoch: 10, started_at: 15 }),
    ];
    // Returns started_at since its available
    expect(getAttemptStartTime(attempts2, attempts2[1])).toBe(15);
  });
});
