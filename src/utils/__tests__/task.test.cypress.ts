import { getTaskDuration, getTaskId } from '../task';
import { createTask } from '../testhelper';

describe('task.ts tests', () => {
  it('getTaskId returns task_name when present', () => {
    expect(getTaskId(createTask({ task_name: 'hello', task_id: 123 }))).to.equal('hello');
  });

  it('getTaskId falls back to task_id when task_name is absent', () => {
    expect(getTaskId(createTask({ task_id: 123 }))).to.equal('123');
  });

  it('getTaskDuration returns stored duration for a completed task', () => {
    expect(getTaskDuration(createTask({ status: 'completed', duration: 5000 }))).to.equal(5000);
  });

  it('getTaskDuration returns null when completed task has no duration or timing fields', () => {
    expect(
      getTaskDuration(createTask({ status: 'completed', duration: undefined, finished_at: undefined })),
    ).to.equal(null);
  });

  it('getTaskDuration returns null for a failed task with no duration', () => {
    expect(getTaskDuration(createTask({ status: 'failed', duration: undefined }))).to.equal(null);
  });

  it('getTaskDuration uses elapsed time for a running task with started_at', () => {
    const startedAt = Date.now() - 3000;
    const duration = getTaskDuration(createTask({ status: 'running', started_at: startedAt, duration: undefined }));
    // Should be approximately 3000ms — allow 200ms tolerance for test execution time
    expect(duration).to.be.greaterThan(2800);
    expect(duration).to.be.lessThan(3200);
  });

  it('getTaskDuration returns null for a running task with no started_at', () => {
    expect(
      getTaskDuration(createTask({ status: 'running', started_at: undefined, duration: undefined })),
    ).to.equal(null);
  });

  it('getTaskDuration does not use elapsed time for a completed task even when started_at is present', () => {
    // A completed task should return stored duration, not Date.now() - started_at
    const task = createTask({ status: 'completed', duration: 1000, started_at: Date.now() - 9999 });
    expect(getTaskDuration(task)).to.equal(1000);
  });
});
