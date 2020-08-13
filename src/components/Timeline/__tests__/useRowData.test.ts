import { Task, Step } from '../../../types';
import { rowDataReducer, createNewStepRowTasks, timepointsOfTasks } from '../useRowData';

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

export function createStep(partialStep: Partial<Step>): Step {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'askel',
    user_name: 'SanteriCM',
    ts_epoch: 0,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialStep,
  };
}

const DEFAULT_ROW_DATA = () => ({
  askel: { step: createStep({}), isOpen: false, finished_at: 0, duration: 0, data: { '1': [createTask({})] } },
});

describe('useRowData hook - reducer', () => {
  it('fillStep - non existing', () => {
    const newState = rowDataReducer({}, { type: 'fillStep', data: [createStep({})] });
    expect(newState['askel'].isOpen).toBe(true);
    expect(newState['askel'].data).toEqual([]);
  });

  it('fillStep - existing', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), { type: 'fillStep', data: [createStep({ ts_epoch: 100 })] });
    expect(newState['askel'].isOpen).toBe(true);
    expect(newState['askel'].step?.ts_epoch).toEqual(100);
  });

  it('fillTasks - empty task list', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), { type: 'fillTasks', data: [] });
    expect(newState).toEqual(DEFAULT_ROW_DATA());
  });

  it('fillTasks - Add task to non existent step', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ step_name: 'newstep', ts_epoch: 100 })],
    });
    expect(Object.keys(newState)).toEqual(['askel', 'newstep']);
    const newStepObject = newState.newstep;
    expect(newStepObject).toEqual({
      isOpen: true,
      finished_at: 100,
      duration: 0,
      data: {
        1: [createTask({ step_name: 'newstep', ts_epoch: 100 })],
      },
    });
  });

  it('fillTasks - Add task to existing step', () => {
    // Fill step row with new task, (of new task id)...
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ step_name: 'askel', task_id: 2, ts_epoch: 100, finished_at: 200 })],
    });
    expect(Object.keys(newState)).toEqual(['askel']);
    const newStepObject = newState.askel;

    expect(Object.keys(newStepObject.data)).toEqual(['1', '2']);
    // Result has added one row to data property AND updated duration and finished_at values
    expect(newStepObject).toEqual({
      step: createStep({}),
      isOpen: false,
      finished_at: 200,
      duration: 200,
      data: {
        '1': [createTask({})],
        '2': [createTask({ step_name: 'askel', task_id: 2, ts_epoch: 100, finished_at: 200 })],
      },
    });
  });

  it('fillTasks - Add task iteration to existing task (re-try)', () => {
    // Fill step row with new task, (of new task id)...
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ ts_epoch: 100, finished_at: 200 })],
    });
    expect(Object.keys(newState)).toEqual(['askel']);
    const newStepObject = newState.askel;

    expect(Object.keys(newStepObject.data)).toEqual(['1']);
    // Result has old task replaced since it didn't have finsihed_at time
    expect(newStepObject).toEqual({
      step: createStep({}),
      isOpen: false,
      finished_at: 200,
      duration: 200,
      data: {
        '1': [createTask({ step_name: 'askel', task_id: 1, ts_epoch: 100, finished_at: 200 })],
      },
    });
  });

  it('toggle', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'toggle', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'askel' exists. Boolean is toggled
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'toggle', id: 'askel' })).not.toEqual(DEFAULT_ROW_DATA());
  });

  it('open', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'open', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'askel' exists. Boolean is set true
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'open', id: 'askel' })['askel'].isOpen).toBe(true);
  });

  it('open', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'close', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'askel' exists. Boolean is set true
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'close', id: 'askel' })['askel'].isOpen).toBe(false);
  });

  it('reset', () => {
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'reset' })).toEqual({});
  });
});

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
