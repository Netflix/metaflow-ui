import { getLongestRowDuration, getTaskLineStatus, startAndEndpointsOfRows } from '../row';
import { createStepRow, createTask, createTaskRow } from '../testhelper';

test('startAndEndpointsOfRows', () => {
  const rows = [
    createTaskRow([createTask({ ts_epoch: 10, finished_at: 50 }), createTask({ ts_epoch: 60, finished_at: 150 })]),
    createTaskRow([createTask({ ts_epoch: 10, finished_at: 50 }), createTask({ ts_epoch: 60, finished_at: 180 })]),
  ];
  expect(startAndEndpointsOfRows(rows)).toEqual({ start: 10, end: 180 });
});

test('getLongestRowDuration', () => {
  const rows = [createTaskRow([createTask({ duration: 90 })]), createTaskRow([createTask({ duration: 40 })])];
  expect(getLongestRowDuration(rows)).toBe(90);
  const rowsWithSteps = [createTaskRow([createTask({ duration: 90 })]), createStepRow({}, { duration: 200 })];
  expect(getLongestRowDuration(rowsWithSteps)).toBe(200);
});

test('getTaskLineStatus', () => {
  // Failed since there is one failed status
  expect(
    getTaskLineStatus([
      createTaskRow([createTask({ status: 'completed' })]),
      createTaskRow([createTask({ status: 'failed' })]),
    ]),
  ).toBe('failed');
  // Running since there is one running status
  expect(
    getTaskLineStatus([
      createTaskRow([createTask({ status: 'running' })]),
      createTaskRow([createTask({ status: 'completed' })]),
    ]),
  ).toBe('running');
  // Unkown since there is one unkown
  expect(
    getTaskLineStatus([
      createTaskRow([createTask({ status: 'unknown' })]),
      createTaskRow([createTask({ status: 'completed' })]),
    ]),
  ).toBe('unknown');

  expect(getTaskLineStatus([createTaskRow([createTask({ status: 'completed' })])])).toBe('completed');
});
