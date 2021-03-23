import { getRunDuration, getRunEndTime, getRunId, getRunStartTime, getTagOfType, getUsername } from '../run';
import { createRun } from '../testhelper';

test('getRunId', () => {
  expect(getRunId(createRun({ run_id: 'hello', run_number: 123 }))).toBe('hello');
  expect(getRunId(createRun({ run_number: 123 }))).toBe('123');
});

test('getUsername', () => {
  expect(getUsername(createRun({ system_tags: [] }))).toBe('');
  expect(getUsername(createRun({ system_tags: ['user:santeri'] }))).toBe('santeri');
});

test('getRunStartTime', () => {
  expect(getRunStartTime(createRun({ ts_epoch: 1000 }))).toBe('01-01-1970 00:00:01');
  expect(getRunStartTime(createRun({ ts_epoch: 1000 }), '+02:00')).toBe('01-01-1970 02:00:01');
  expect(getRunStartTime(createRun({ ts_epoch: 1000 }), '-02:00')).toBe('12-31-1969 22:00:01');
});

test('getRunEndTime', () => {
  expect(getRunEndTime(createRun({}))).toBe(null);
  expect(getRunEndTime(createRun({ finished_at: 1000 }))).toBe('01-01-1970 00:00:01');
  expect(getRunEndTime(createRun({ finished_at: 1000 }), '+02:00')).toBe('01-01-1970 02:00:01');
  expect(getRunEndTime(createRun({ finished_at: 1000 }), '-02:00')).toBe('12-31-1969 22:00:01');
});

test('getRunDuration', () => {
  expect(getRunDuration(createRun({}))).toBe(null);
  expect(getRunDuration(createRun({ duration: 1000 }))).toBe('1s');
  expect(getRunDuration(createRun({ ts_epoch: 0, finished_at: 1000, duration: undefined }))).toBe('1s');
});

test('getTagOfType', () => {
  expect(getTagOfType([], 'user')).toBe(null);
  const tags = ['user:santeri', 'project:metaflow', 'year:2021', 'test:'];
  expect(getTagOfType(tags, 'user')).toBe('santeri');
  expect(getTagOfType(tags, 'project')).toBe('metaflow');
  expect(getTagOfType(tags, 'year')).toBe('2021');
  expect(getTagOfType(tags, 'test')).toBe('');
});
