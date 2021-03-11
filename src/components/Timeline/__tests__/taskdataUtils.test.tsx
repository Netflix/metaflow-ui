import { Step, Task, TaskStatus } from '../../../types';
import { countTaskRowsByStatus, getStepStatus, makeTasksForStep, timepointsOfTasks } from '../taskdataUtils';
import { RowDataModel } from '../useTaskData';
import { createStep, createTask } from './useTaskData.test';

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
        '1': [createTask({ status: 'failed' }), createTask({ status: 'failed' })],
        '2': [createTask({ status: 'completed' })],
        '3': [createTask({ status: 'failed' }), createTask({ status: 'running' })],
      }),
    };

    expect(countTaskRowsByStatus(DATA)).toEqual({
      all: 3,
      completed: 1,
      running: 1,
      failed: 1,
    });
  });

  //
  // timepointsOfTasks
  //

  it('timepointsOfTasks', () => {
    // When non of tasks have finish time, end time will be biggest start time
    expect(timepointsOfTasks([createTask({}), createTask({}), createTask({})])).toEqual([null, 0]);
    expect(
      timepointsOfTasks([
        createTask({ started_at: 10 }),
        createTask({ started_at: 20 }),
        createTask({ started_at: 15 }),
      ]),
    ).toEqual([10, 20]);

    expect(timepointsOfTasks([createTask({}), createTask({}), createTask({ finished_at: 800 })])).toEqual([null, 800]);
    expect(
      timepointsOfTasks([
        createTask({ started_at: 100, finished_at: 200 }),
        createTask({ started_at: 86, finished_at: 123 }),
        createTask({ started_at: 123, finished_at: 800 }),
      ]),
    ).toEqual([86, 800]);

    // In this case, one of ts_epoch is highest value of all so it will be returned as endtime
    expect(
      timepointsOfTasks([
        createTask({ started_at: 100, finished_at: 200 }),
        createTask({ started_at: 950 }),
        createTask({ started_at: 35, finished_at: 500 }),
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
