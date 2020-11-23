import { Step, Task } from '../../types';
import { RowDataModel } from './useRowData';

//
// Counts rows
//

export type RowCounts = {
  all: number;
  completed: number;
  running: number;
  failed: number;
};

export function countTaskRowsByStatus(rows: RowDataModel): RowCounts {
  const counts = {
    all: 0,
    completed: 0,
    running: 0,
    failed: 0,
  };

  // Iterate steps
  for (const stepName of Object.keys(rows)) {
    // ...Wihtout steps that start with underscore because user is not interested on them
    if (!stepName.startsWith('_')) {
      const stepRow = rows[stepName];
      // Iterate all task rows on step
      for (const taskId of Object.keys(stepRow.data)) {
        const taskRow = stepRow.data[taskId];
        // Map statuses of all attempts on single row and count
        const allStatuses = taskRow.map((t) => t.status);

        counts.all++;
        if (allStatuses.indexOf('completed') > -1) {
          counts.completed++;
        } else if (allStatuses.indexOf('running') > -1) {
          counts.running++;
        }
        // If there is more than 1 task on one row, there must be multiple attempts which means that some
        // of them has failed
        if (allStatuses.indexOf('failed') > -1 || taskRow.length > 1) {
          counts.failed++;
        }
      }
    }
  }

  return counts;
}

//
// Make step line data for minimap
//

export type StepLineData = {
  started_at: number;
  finished_at: number;
  isFailed: boolean;
  step_name: string;
  original?: Step;
};

export function makeStepLineData(rows: RowDataModel): StepLineData[] {
  return Object.keys(rows).reduce((arr: StepLineData[], key) => {
    if (key.startsWith('_')) return arr;
    const row = rows[key];
    return arr.concat([
      {
        started_at: row.step?.ts_epoch || 0,
        finished_at: row.finished_at,
        isFailed: row.isFailed,
        original: row.step,
        step_name: key,
      },
    ]);
  }, []);
}

//
// Find earliest and latest point from list of tasks
//

export function timepointsOfTasks(tasks: Task[]): [number, number] {
  return tasks.reduce(
    (val, task) => {
      const taskStartTime = task.started_at || task.ts_epoch;
      const highpoint: number =
        task.finished_at && task.finished_at > val[1]
          ? task.finished_at
          : taskStartTime > val[1]
          ? taskStartTime
          : val[1];
      const lowpoint: number = taskStartTime < val[0] ? taskStartTime : val[0];
      return [lowpoint, highpoint];
    },
    [tasks[0] ? tasks[0].started_at || tasks[0].ts_epoch : 0, 0],
  );
}

//
// Check if step is failure. Only checks new tasks we just got from server. This might cause an issue
// though if we get successful tasks after getting failed ones (should not really happen).
//

export function isFailedStep(stepTaskData: Record<string, Task[]>, newTasks: Task[]): boolean {
  const ids = newTasks.map((t) => t.task_id);

  for (const [key, tasks] of Object.entries(stepTaskData)) {
    if (ids.indexOf(key) > -1) {
      const hasFailed = tasks[tasks.length - 1].status === 'failed';
      if (hasFailed) {
        return true;
      }
    }
  }
  return false;
}

//
// Merge or add new data to row information.
// If there is already data about smae task, with same attempt_id we want to replace
// that data. Else we add new task
//

export function makeTasksForStep(currentData: Record<string, Task[]>, item: Task): Task[] {
  if (currentData[item.task_id]) {
    const newtasks = currentData[item.task_id];

    // Process duration and start time for task since they are somewhat uncertain from API
    // NOTE: WE ARE MUTATING TASK VALUES HERE BECAUSE VALUES GIVEN BY BACKEND MIGHT NOT BE CORRECT
    // SINCE STARTED AT AND DURATION MIGHT BE INCORRECT IN SOME SITUATIONS!!!
    if (!item.started_at) {
      if (item.attempt_id === 0) {
        item.started_at = item.ts_epoch;
        item.duration = item.duration || (item.finished_at ? item.finished_at - item.ts_epoch : undefined);
      } else {
        const prevTask = currentData[item.task_id].find((t) => t.attempt_id === item.attempt_id - 1);
        item.started_at = item.started_at || prevTask?.finished_at || undefined;
        item.duration = item.started_at && item.finished_at ? item.finished_at - item.started_at : undefined;
      }
    }

    // Track if we replaced old data...
    let added = false;
    for (const index in newtasks) {
      if (newtasks[index].attempt_id === item.attempt_id) {
        added = true;
        newtasks[index] = item;
      }
    }
    // ...else add as new task
    if (!added) {
      newtasks.push(item);
    }
    return newtasks;
  } else {
    return [item];
  }
}
