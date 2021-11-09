import { StepRow } from '../../../components/Timeline/VirtualizedTimeline';
import {
  createRowDataModel,
  createStepRow,
  createStepRowData,
  createTask,
  createTaskListSettings,
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
  it('hasViewTypeParam', () => {
    expect(hasViewTypeParam(undefined)).to.equal(false);
    expect(hasViewTypeParam('hello world')).to.equal(true);
  });

  it('getTaskPageLink', () => {
    // with previous task info and no params
    expect(getTaskPageLink('flow', 'run', 'prevStep', 'prevTask', '', {})).to.equal('/flow/run/prevStep/prevTask');
    // with previous task info and some params
    expect(getTaskPageLink('flow', 'run', 'prevStep', 'prevTask', 'status=completed', {})).to.equal(
      '/flow/run/prevStep/prevTask?status=completed',
    );
    // without previous task info and no task rows
    expect(getTaskPageLink('flow', 'run', undefined, undefined, '', {})).to.equal('/flow/run/view/task');
    // without previous task info and with task rows
    expect(getTaskPageLink('flow', 'run', undefined, undefined, '', createRowDataModel({}))).to.equal(
      '/flow/run/start/1',
    );
    // without previous task info and with task rows and with params
    expect(getTaskPageLink('flow', 'run', undefined, undefined, 'status=ok', createRowDataModel({}))).to.equal(
      '/flow/run/start/1?status=ok',
    );
  });

  it('getTaskFromList', () => {
    expect(getTaskFromList({}, undefined, undefined)).to.equal(null);
    expect(getTaskFromList({}, 'undefined', 'undefined')).to.equal(null);
    const model = createRowDataModel({});
    expect(getTaskFromList(model, 'start', '1')).to.equal(model.start.data['1']);
  });
});

describe('Run utils - Row making test set', () => {
  it('makeVisibleRows - Most basic settings', () => {
    const model = createRowDataModel({});
    const graph = createTaskListSettings({});
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since there is 1 step and 1 task
    expect(rows.length).to.equal(2);
  });

  it('makeVisibleRows - Step filtered by visibleSteps', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createTaskListSettings({});
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since end step and its tasks are filtered by visible steps
    expect(rows.length).to.equal(2);
  });

  it('makeVisibleRows - Multiple steps', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createTaskListSettings({});
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 4 since there is 2 steps with 1 tasks each
    expect(rows.length).to.equal(4);
  });

  it('makeVisibleRows - Multiple steps with one step closed', () => {
    const model = createRowDataModel({ end: createStepRowData({ isOpen: false }, { step_name: 'end' }, {}) });
    const graph = createTaskListSettings({});
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 3 since there is 2 steps with 1 tasks each but end step is closed
    expect(rows.length).to.equal(3);
  });

  it('makeVisibleRows - With grouping off', () => {
    const model = createRowDataModel({ end: createStepRowData({}, { step_name: 'end' }, {}) });
    const graph = createTaskListSettings({ group: false });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 2 since there is 2 steps with 1 tasks each but grouping is off so steps are filtered out
    expect(rows.length).to.equal(2);
  });

  it('makeVisibleRows - With search results loading', () => {
    const model = createRowDataModel({});
    const graph = createTaskListSettings({ group: false });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'Loading' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 0 since we are still searching for search results
    expect(rows.length).to.equal(0);
  });

  it('makeVisibleRows - With search results ok', () => {
    const model = createRowDataModel({
      end: createStepRowData({ data: { 2: [createTask({ task_id: 2 })] } }, { step_name: 'end' }, {}),
    });
    const graph = createTaskListSettings({});
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
    expect(rows.length).to.equal(3);
    expect((rows[0] as StepRow).rowObject.tasksTotal).to.equal(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).to.equal(1);
    expect(rows[1].type).to.equal('task');
    expect((rows[2] as StepRow).rowObject.tasksTotal).to.equal(1);
    expect((rows[2] as StepRow).rowObject.tasksVisible).to.equal(0);
  });

  it('makeVisibleRows - status filter, no results', () => {
    const model = createRowDataModel({});
    const graph = createTaskListSettings({ statusFilter: 'running' });
    const visibleSteps = ['start'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 1 since there's single step but no visible tasks due to filter. Returning one step with no tasks
    expect(rows.length).to.equal(1);
    expect((rows[0] as StepRow).rowObject.tasksTotal).to.equal(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).to.equal(0);
  });

  it('makeVisibleRows - status filter, has results', () => {
    const model = createRowDataModel({
      end: createStepRowData(
        { data: { 2: [createTask({ task_id: 2, status: 'running' })] } },
        { step_name: 'end' },
        {},
      ),
    });
    const graph = createTaskListSettings({ statusFilter: 'running' });
    const visibleSteps = ['start', 'end'];
    const searchResult = { status: 'NotAsked' as const, result: [] };

    const rows = makeVisibleRows(model, graph, visibleSteps, searchResult);
    // Expected result is 3 since there are two steps but only one of them has visible task. Returning two steps and one task
    expect(rows.length).to.equal(3);
    expect((rows[0] as StepRow).rowObject.tasksTotal).to.equal(1);
    expect((rows[0] as StepRow).rowObject.tasksVisible).to.equal(0);
    expect((rows[1] as StepRow).rowObject.tasksTotal).to.equal(1);
    expect((rows[1] as StepRow).rowObject.tasksVisible).to.equal(1);
    expect(rows[2].type).to.equal('task');
  });

  it('shouldApplySearchFilter', () => {
    expect(shouldApplySearchFilter({ status: 'NotAsked', result: [] })).to.equal(false);
    expect(shouldApplySearchFilter({ status: 'Loading', result: [] })).to.equal(true);
    expect(shouldApplySearchFilter({ status: 'Error', errorMsg: 'test', result: [] })).to.equal(true);
    expect(shouldApplySearchFilter({ status: 'Ok', result: [] })).to.equal(true);
  });

  it('getRowStartTime', () => {
    expect(getRowStartTime(createStepRow({}, {}))).to.equal(0);
    expect(getRowStartTime(createTaskRow([createTask({ ts_epoch: 500 })]))).to.equal(500);
    expect(getRowStartTime(createTaskRow([createTask({ started_at: 500, ts_epoch: 400 })]))).to.equal(500);
  });

  it('getRowFinishedTime', () => {
    expect(getRowFinishedTime(createStepRow({}, {}))).to.equal(0);
    expect(getRowFinishedTime(createTaskRow([createTask({ finished_at: 500 })]))).to.equal(500);
    expect(getRowFinishedTime(createTaskRow([createTask({ finished_at: undefined, ts_epoch: 500 })]))).to.equal(500);
    expect(
      getRowFinishedTime(
        createTaskRow([createTask({ finished_at: undefined, ts_epoch: 500 }), createTask({ finished_at: 800 })]),
      ),
    ).to.equal(800);
  });

  it('taskDuration', () => {
    expect(taskDuration(createStepRow({}, {}))).to.equal(0);
    expect(taskDuration(createTaskRow([createTask({ finished_at: 500, started_at: 100 })]))).to.equal(400);

    expect(
      taskDuration(
        createTaskRow([
          createTask({ finished_at: 500, started_at: 100 }),
          createTask({ finished_at: 1200, started_at: 600 }),
        ]),
      ),
    ).to.equal(1100);
  });

  const task_a = createTaskRow([createTask({ ts_epoch: 20, finished_at: 40 })]);
  const task_b = createTaskRow([createTask({ ts_epoch: 10, finished_at: 30 })]);
  const task_c = createTaskRow([createTask({ ts_epoch: 10, finished_at: 20 })]);
  it('sortRows', () => {
    expect(sortRows('startTime', 'asc')(task_a, task_b)).to.be.greaterThan(0);
    expect(sortRows('startTime', 'desc')(task_a, task_b)).to.be.lessThan(0);
    expect(sortRows('endTime', 'asc')(task_a, task_b)).to.be.greaterThan(0);
    expect(sortRows('endTime', 'desc')(task_a, task_b)).to.be.lessThan(0);
    expect(sortRows('duration', 'asc')(task_a, task_b)).to.equal(0);
    expect(sortRows('duration', 'asc')(task_a, task_c)).to.be.greaterThan(0);
    expect(sortRows('duration', 'desc')(task_a, task_c)).to.be.lessThan(0);
  });
});
