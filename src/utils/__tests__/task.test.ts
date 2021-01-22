import { getTaskId } from '../task';
import { createTask } from '../testhelper';

test('getTaskId', () => {
  expect(getTaskId(createTask({ task_name: 'hello', task_id: 123 }))).toBe('hello');
  expect(getTaskId(createTask({ task_id: 123 }))).toBe('123');
});
