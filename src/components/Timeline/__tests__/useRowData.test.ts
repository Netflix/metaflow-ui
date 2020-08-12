import { Task } from '../../../types';
import { createNewStepRowTasks, timepointsOfTasks } from '../useRowData';

export function createTask(partialTask: Partial<Task>): Task {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'askel',
    task_id: 1,
    user_name: 'SanteriCM',
    ts_epoch: 0,
    duration: 100,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialTask,
  };
}

describe('useRowData hook - reducer', () => {});

describe('useRowData hook - supporting functions', () => {
  it('createNewStepRowTasks - basic', () => {
    expect(createNewStepRowTasks({}, createTask({})).length).toBe(1);
  });

  it('createNewStepRowTasks - add to existing', () => {
    expect(createNewStepRowTasks({ 1: [createTask({ finished_at: 100 })] }, createTask({ task_id: 1 })).length).toBe(2);
  });

  it('createNewStepRowTasks - replace in existing', () => {
    const result = createNewStepRowTasks(
      { 1: [createTask({})] },
      createTask({ task_id: 1, finished_at: 100, user_name: 'TestTester' }),
    );
    expect(result.length).toBe(1);
    expect(result[0].user_name).toBe('TestTester');
  });

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
});
