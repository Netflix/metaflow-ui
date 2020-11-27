import { Task } from '../types';

export function getTaskId(task: Task): string {
  return task.task_name || (task.task_id || 0).toString();
}
