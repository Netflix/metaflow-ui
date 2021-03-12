import { Task, Step, TaskStatus } from '../../../types';
import { rowDataReducer } from '../useTaskData';

export function createTask(partialTask: Partial<Task>): Task {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'start',
    task_id: 1,
    user_name: 'SanteriCM',
    status: 'completed',
    ts_epoch: 0,
    attempt_id: 0,
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
    step_name: 'start',
    user_name: 'SanteriCM',
    ts_epoch: 0,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialStep,
  };
}

const DEFAULT_ROW_DATA = () => ({
  start: {
    step: createStep({}),
    isOpen: false,
    status: 'completed' as TaskStatus,
    finished_at: 0,
    duration: 0,
    data: { '1': [createTask({})] },
  },
});

describe('useRowData hook - reducer', () => {
  it('fillStep - non existing', () => {
    const newState = rowDataReducer({}, { type: 'fillStep', data: [createStep({})] });
    expect(newState['start'].isOpen).toBe(true);
    expect(newState['start'].data).toEqual({});
  });

  it('fillStep - existing', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), { type: 'fillStep', data: [createStep({ ts_epoch: 100 })] });
    expect(newState['start'].isOpen).toBe(true);
    expect(newState['start'].step?.ts_epoch).toEqual(100);
  });

  it('fillTasks - empty task list', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), { type: 'fillTasks', data: [] });
    expect(newState).toEqual(DEFAULT_ROW_DATA());
  });

  it('fillTasks - Add task to non existent step', () => {
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ step_name: 'newstep', started_at: 100 })],
    });
    expect(Object.keys(newState)).toEqual(['start', 'newstep']);
    const newStepObject = newState.newstep;
    expect(newStepObject).toEqual({
      isOpen: true,
      finished_at: 100,
      status: 'completed',
      duration: 0,
      data: {
        1: [createTask({ step_name: 'newstep', started_at: 100 })],
      },
    });
  });

  it('fillTasks - Add task to existing step', () => {
    // Fill step row with new task, (of new task id)...
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ step_name: 'start', task_id: 2, ts_epoch: 100, finished_at: 200 })],
    });
    expect(Object.keys(newState)).toEqual(['start']);
    const newStepObject = newState.start;

    expect(Object.keys(newStepObject.data)).toEqual(['1', '2']);
    // Result has added one row to data property AND updated duration and finished_at values
    expect(newStepObject).toEqual({
      step: createStep({}),
      isOpen: false,
      finished_at: 200,
      status: 'completed',
      duration: 200,
      data: {
        '1': [createTask({})],
        '2': [createTask({ step_name: 'start', task_id: 2, ts_epoch: 100, finished_at: 200 })],
      },
    });
  });

  it('fillTasks - Add task iteration to existing task (re-try)', () => {
    // Fill step row with new task, (of new task id)...
    const newState = rowDataReducer(DEFAULT_ROW_DATA(), {
      type: 'fillTasks',
      data: [createTask({ ts_epoch: 100, finished_at: 200 })],
    });
    expect(Object.keys(newState)).toEqual(['start']);
    const newStepObject = newState.start;

    expect(Object.keys(newStepObject.data)).toEqual(['1']);
    // Result has old task replaced since it didn't have finsihed_at time
    expect(newStepObject).toEqual({
      step: createStep({}),
      isOpen: false,
      finished_at: 200,
      status: 'completed',
      duration: 200,
      data: {
        '1': [createTask({ step_name: 'start', task_id: 1, ts_epoch: 100, finished_at: 200, started_at: 100 })],
      },
    });
  });

  it('toggle', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'toggle', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'start' exists. Boolean is toggled
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'toggle', id: 'start' })).not.toEqual(DEFAULT_ROW_DATA());
  });

  it('open', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'open', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'start' exists. Boolean is set true
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'open', id: 'start' })['start'].isOpen).toBe(true);
  });

  it('open', () => {
    // Row with 'non-esixiting-id' doesnt exist so state is equals to old state
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'close', id: 'non-existing-id' })).toEqual(DEFAULT_ROW_DATA());
    // Row with 'start' exists. Boolean is set true
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'close', id: 'start' })['start'].isOpen).toBe(false);
  });

  it('reset', () => {
    expect(rowDataReducer(DEFAULT_ROW_DATA(), { type: 'reset' })).toEqual({});
  });
});
