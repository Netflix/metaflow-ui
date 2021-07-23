import { getTaskId } from '../task';
import { createTask } from '../testhelper';

describe('task.ts tests', () => {
  it('getTaskId', () => {
    expect(getTaskId(createTask({ task_name: 'hello', task_id: 123 }))).to.equal('hello');
    expect(getTaskId(createTask({ task_id: 123 }))).to.equal('123');
  });
});
