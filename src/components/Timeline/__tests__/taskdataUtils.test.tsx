import { Step, Task, TaskStatus } from '../../../types';
import { countTaskRowsByStatus, getStepStatus, makeTasksForStep, timepointsOfTasks } from '../taskdataUtils';
import { RowDataModel } from '../useRowData';
import { createStep, createTask } from './useRowData.test';

function makeRowData(step: Step, data: Record<string, Task[]>) {
  return {
    step,
    isOpen: false,
    status: 'completed' as TaskStatus,
    finished_at: 0,
    duration: 0,
    data,
  };
}

describe('taskdataUtils tests', () => {
  //
  // countTaskRowByStatus
  //

  it('countTaskRowsByStatus - basic', () => {
    const DATA: RowDataModel = {
      step: makeRowData(createStep({}), {
        '1': [createTask({ status: 'failed' })],
        '2': [createTask({ status: 'completed' })],
        '3': [createTask({ status: 'running' })],
      }),
    };

    expect(countTaskRowsByStatus(DATA)).toEqual({
      all: 3,
      completed: 1,
      running: 1,
      failed: 1,
    });
  });

  it('countTaskRowsByStatus - count tasks of all steps', () => {
    const DATA: RowDataModel = {
      step: makeRowData(createStep({}), {
        '1': [createTask({ status: 'failed' })],
        '2': [createTask({ status: 'completed' })],
        '3': [createTask({ status: 'running' })],
      }),
      step2: makeRowData(createStep({}), {
        '1': [createTask({ status: 'failed' })],
        '2': [createTask({ status: 'completed' })],
        '3': [createTask({ status: 'running' })],
      }),
    };

    expect(countTaskRowsByStatus(DATA)).toEqual({
      all: 6,
      completed: 2,
      running: 2,
      failed: 2,
    });
  });

  it('countTaskRowsByStatus - count completed and failed correctly', () => {
    const DATA: RowDataModel = {
      step: makeRowData(createStep({}), {
        // If there is even one completed, we will count it as completed. But it will also be visible in failed
        '1': [createTask({ status: 'failed' }), createTask({ status: 'completed' })],
        '2': [createTask({ status: 'completed' })],
        // If there is multiple tasks, there must have been atleast one fail no matter what.
        '3': [createTask({ status: 'running' }), createTask({ status: 'running' })],
      }),
    };

    expect(countTaskRowsByStatus(DATA)).toEqual({
      all: 3,
      completed: 2,
      running: 1,
      failed: 2,
    });
  });

  //
  // timepointsOfTasks
  //

  it('timepointsOfTasks', () => {
    // When non of tasks have finish time, end time will be biggest start time
    expect(timepointsOfTasks([createTask({}), createTask({}), createTask({})])).toEqual([0, 0]);
    expect(
      timepointsOfTasks([createTask({ ts_epoch: 10 }), createTask({ ts_epoch: 20 }), createTask({ ts_epoch: 15 })]),
    ).toEqual([10, 20]);

    expect(timepointsOfTasks([createTask({}), createTask({}), createTask({ finished_at: 800 })])).toEqual([0, 800]);
    expect(
      timepointsOfTasks([
        createTask({ ts_epoch: 100, finished_at: 200 }),
        createTask({ ts_epoch: 86, finished_at: 123 }),
        createTask({ ts_epoch: 123, finished_at: 800 }),
      ]),
    ).toEqual([86, 800]);

    // In this case, one of ts_epoch is highest value of all so it will be returned as endtime
    expect(
      timepointsOfTasks([
        createTask({ ts_epoch: 100, finished_at: 200 }),
        createTask({ ts_epoch: 950 }),
        createTask({ ts_epoch: 35, finished_at: 500 }),
      ]),
    ).toEqual([35, 950]);
  });

  //
  // getStepStatus
  //

  it('getStepStatus', () => {
    const FAILED_TASK = createTask({ task_id: 2, status: 'failed' });
    const DATA = {
      '1': [createTask({ task_id: 1 })],
      '2': [FAILED_TASK],
    };

    expect(getStepStatus(DATA)).toBe('failed');
  });

  //
  // makeTasksForStep
  //

  it('makeTasksForStep - basic', () => {
    expect(makeTasksForStep({}, createTask({})).length).toBe(1);
  });

  it('makeTasksForStep - add to existing', () => {
    expect(
      makeTasksForStep({ 1: [createTask({ finished_at: 100 })] }, createTask({ task_id: 1, attempt_id: 2 })).length,
    ).toBe(2);
  });

  it('makeTasksForStep - replace in existing', () => {
    const result = makeTasksForStep(
      { 1: [createTask({})] },
      createTask({ task_id: 1, finished_at: 100, user_name: 'TestTester' }),
    );
    expect(result.length).toBe(1);
    expect(result[0].user_name).toBe('TestTester');
  });
});
