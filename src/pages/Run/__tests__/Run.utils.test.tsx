import { StepRow } from '../../../components/Timeline/VirtualizedTimeline';
import {
  createGraphState,
  createRowDataModel,
  createStepRow,
  createStepRowData,
  createTask,
  createTaskRow,
} from '../../../utils/testhelper';
import {
  getTaskFromList,
  getTaskPageLink,
  hasViewTypeParam,
  makeVisibleRows,
  shouldApplySearchFilter,
  getRowStartTime,
  getRowFinishedTime,
  taskDuration,
  sortRows,
} from '../Run.utils';

describe('Run utils test set', () => {
  test('hasViewTypeParam', () => {
    expect(hasViewTypeParam(undefined)).toBe(false);
    expect(hasViewTypeParam('hello world')).toBe(false);
    expect(hasViewTypeParam('dag')).toBe(true);
    expect(hasViewTypeParam('timeline')).toBe(true);
    expect(hasViewTypeParam('task')).toBe(true);
  });

  test('getTaskPageLink', () => {
    // with previous task info and no params
    expect(getTaskPageLink('flow', 'run', 'prevStep', 'prevTask', '', {})).toBe('/flow/run/prevStep/prevTask');
    // with previous task info and some params
    expect(getTaskPageLink('flow', 'run', 'prevStep', 'prevTask', 'status=completed', {})).toBe(
      '/flow/run/prevStep/prevTask?status=completed',
    );
    // without previous task info and no task rows
    expect(getTaskPageLink('flow', 'run', undefined, undefined, '', {})).toBe('/flow/run/view/task');
    // without previous task info and with task rows
    expect(getTaskPageLink('flow', 'run', undefined, undefined, '', createRowDataModel({}))).toBe('/flow/run/start/1');
    // without previous task info and with task rows and with params
    expect(getTaskPageLink('flow', 'run', undefined, undefined, 'status=ok', createRowDataModel({}))).toBe(
      '/flow/run/start/1?status=ok',
    );
  });

  test('getTaskFromList', () => {
    expect(getTaskFromList({}, undefined, undefined)).toBe(null);
    expect(getTaskFromList({}, 'undefined', 'undefined')).toBe(null);
    const model = createRowDataModel({});
    expect(getTaskFromList(model, 'start', '1')).toEqual(model.start.data['1']);
  });
});

describe('Run utils - Row making test set', () => {
  test('makeVisibleRows - Most basic settings', () => {
    const model = createRowDataModel({});
    const graph = createGraphState({});
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since there is 1 step and 1 task
    expect(rows.length).toBe(2);
  });

  test('makeVisibleRows - Step filtered by visibleSteps', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createGraphState({});
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since end step and its tasks are filtered by visible steps
    expect(rows.length).toBe(2);
  });

  test('makeVisibleRows - Multiple steps', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createGraphState({});
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 4 since there is 2 steps with 1 tasks each
    expect(rows.length).toBe(4);
  });

  test('makeVisibleRows - Multiple steps with one step closed', () => {
    const model = createRowDataModel({ end: createStepRowData({ isOpen: false }, { step_name: 'end' }, {}) });
    const graph = createGraphState({});
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 3 since there is 2 steps with 1 tasks each but end step is closed
    expect(rows.length).toBe(3);
  });

  test('makeVisibleRows - With grouping off', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createGraphState({ group: false });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since there is 2 steps with 1 tasks each but grouping is off so steps are filtered out
    expect(rows.length).toBe(2);
  });

  test('makeVisibleRows - With search results loading', () => {
    const model = createRowDataModel({});
    const graph = createGraphState({ group: false });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'Loading' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 0 since we are still searching for search results
    expect(rows.length).toBe(0);
  });

  test('makeVisibleRows - With search results ok', () => {
    const model = createRowDataModel({
      end: createStepRowData({ data: { 2: [createTask({ task_id: 2 })] } }, { step_name: 'end' }, {}),
    });
    const graph = createGraphState({});
    const visibleSteps = ['start', 'end'];
    const searchResult = {
      status: 'Ok' as const,
      result: [
        {
          flow_id: 'BasicFlow',
          run_number: '1',
          searchable: true,
          step_name: 'start',
          task_id: '1',
        },
      ],
    };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 3 since search result includes item from start tasks -> Return two steps (one having no tasks) and a task
    expect(rows.length).toBe(3);
    expect((rows[0] as StepRow).rowObject.tasksTotal).toBe(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).toBe(1);
    expect(rows[1].type).toBe('task');
    expect((rows[2] as StepRow).rowObject.tasksTotal).toBe(1);
    expect((rows[2] as StepRow).rowObject.tasksVisible).toBe(0);
  });

  test('makeVisibleRows - status filter, no results', () => {
    const model = createRowDataModel({});
    const graph = createGraphState({ statusFilter: 'running' });
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 1 since there's single step but no visible tasks due to filter. Returning one step with no tasks
    expect(rows.length).toBe(1);
    expect((rows[0] as StepRow).rowObject.tasksTotal).toBe(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).toBe(0);
  });

  test('makeVisibleRows - status filter, has results', () => {
    const model = createRowDataModel({
      end: createStepRowData(
        { data: { 2: [createTask({ task_id: 2, status: 'running' })] } },
        { step_name: 'end' },
        {},
      ),
    });
    const graph = createGraphState({ statusFilter: 'running' });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 3 since there are two steps but only one of them has visible task. Returning two steps and one task
    expect(rows.length).toBe(3);
    expect((rows[0] as StepRow).rowObject.tasksTotal).toBe(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).toBe(0);
    expect((rows[1] as StepRow).rowObject.tasksTotal).toBe(1);
    expect((rows[1] as StepRow).rowObject.tasksVisible).toBe(1);
    expect(rows[2].type).toBe('task');
  });

  test('shouldApplySearchFilter', () => {
    expect(shouldApplySearchFilter({ status: 'NotAsked', result: [] })).toBe(false);
    expect(shouldApplySearchFilter({ status: 'Loading', result: [] })).toBe(true);
    expect(shouldApplySearchFilter({ status: 'Error', result: [] })).toBe(true);
    expect(shouldApplySearchFilter({ status: 'Ok', result: [] })).toBe(true);
  });

  test('getRowStartTime', () => {
    expect(getRowStartTime(createStepRow({}, {}))).toBe(0);
    expect(getRowStartTime(createTaskRow([createTask({ ts_epoch: 500 })]))).toBe(500);
    expect(getRowStartTime(createTaskRow([createTask({ started_at: 500, ts_epoch: 400 })]))).toBe(500);
  });

  test('getRowFinishedTime', () => {
    expect(getRowFinishedTime(createStepRow({}, {}))).toBe(0);
    expect(getRowFinishedTime(createTaskRow([createTask({ finished_at: 500 })]))).toBe(500);
    expect(getRowFinishedTime(createTaskRow([createTask({ finished_at: undefined, ts_epoch: 500 })]))).toBe(500);
    expect(
      getRowFinishedTime(
        createTaskRow([createTask({ finished_at: undefined, ts_epoch: 500 }), createTask({ finished_at: 800 })]),
      ),
    ).toBe(800);
  });

  test('taskDuration', () => {
    expect(taskDuration(createStepRow({}, {}))).toBe(0);
    expect(taskDuration(createTaskRow([createTask({ finished_at: 500, started_at: 100 })]))).toBe(400);

    expect(
      taskDuration(
        createTaskRow([
          createTask({ finished_at: 500, started_at: 100 }),
          createTask({ finished_at: 1200, started_at: 600 }),
        ]),
      ),
    ).toBe(1100);
  });

  const task_a = createTaskRow([createTask({ ts_epoch: 20, finished_at: 40 })]);
  const task_b = createTaskRow([createTask({ ts_epoch: 10, finished_at: 30 })]);
  const task_c = createTaskRow([createTask({ ts_epoch: 10, finished_at: 20 })]);
  test('sortRows', () => {
    expect(sortRows('startTime', 'asc')(task_a, task_b)).toBeGreaterThan(0);
    expect(sortRows('startTime', 'desc')(task_a, task_b)).toBeLessThan(0);
    expect(sortRows('endTime', 'asc')(task_a, task_b)).toBeGreaterThan(0);
    expect(sortRows('endTime', 'desc')(task_a, task_b)).toBeLessThan(0);
    expect(sortRows('duration', 'asc')(task_a, task_b)).toBe(0);
    expect(sortRows('duration', 'asc')(task_a, task_c)).toBeGreaterThan(0);
    expect(sortRows('duration', 'desc')(task_a, task_c)).toBeLessThan(0);
  });
});
