import { Task } from '../types';

/**
 * Task id might come as string or number. Make sure we have string
 */
export function getTaskId(task: Task): string {
  return task.task_name || (task.task_id || 0).toString();
}

/**
 * Return task duration with hadnling for running state. If task is in running state, we want to compare its start time to
 * current time. Note that we are not camparing current time to ts_epoch field, which is just time for task object, not actual task time itself.
 */
export function getTaskDuration(task: Task): number | null {
  return task.status === 'running' && task.started_at
    ? Date.now() - task.started_at
    : task.duration
    ? task.duration
    : null;
}
