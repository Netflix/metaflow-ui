import { Task } from '../types';

export function getTaskId(task: Task): string {
  return task.task_name || (task.task_id || 0).toString();
}

export function getTaskDuration(task: Task): number | null {
  return task.status === 'running' && task.started_at
    ? Date.now() - task.started_at
    : task.duration
    ? task.duration
    : null;
}
