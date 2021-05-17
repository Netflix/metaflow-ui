import { Step, Task, TaskStatus } from '../../types';
import { RowDataModel } from './useTaskData';

//
// Counts rows
//

export type RowCounts = {
  all: number;
  completed: number;
  running: number;
  failed: number;
  unknown: number;
};

export function countTaskRowsByStatus(rows: RowDataModel): RowCounts {
  const counts = {
    all: 0,
    completed: 0,
    running: 0,
    failed: 0,
    unknown: 0,
  };

  // Iterate steps
  for (const stepName of Object.keys(rows)) {
    // ...Wihtout steps that start with underscore because user is not interested on them
    if (!stepName.startsWith('_')) {
      const stepRow = rows[stepName];
      // Iterate all task rows on step
      for (const taskId of Object.keys(stepRow.data)) {
        const taskRow = stepRow.data[taskId];

        if (taskRow.length > 0) {
          const task = taskRow[taskRow.length - 1];

          counts.all++;
          if (task.status === 'completed') {
            counts.completed++;
          } else if (task.status === 'running') {
            counts.running++;
          } else if (task.status === 'failed') {
            counts.failed++;
          } else if (task.status === 'unknown') {
            counts.unknown++;
          }
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
  status: TaskStatus;
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
        status: row.status,
        original: row.step,
        step_name: key,
      },
    ]);
  }, []);
}

//
// Find earliest and latest point from list of tasks
//

export function timepointsOfTasks(tasks: Task[]): [number | null, number] {
  return tasks.reduce(
    (val, task) => {
      const taskStartTime = task.started_at;
      const highpoint: number =
        task.finished_at && task.finished_at > val[1]
          ? task.finished_at
          : taskStartTime && taskStartTime > val[1]
          ? taskStartTime
          : val[1];
      const lowpoint: number | null =
        taskStartTime && val[0] === null
          ? taskStartTime
          : taskStartTime && val[0] !== null
          ? taskStartTime < val[0]
            ? taskStartTime
            : val[0]
          : val[0];
      return [lowpoint, highpoint];
    },
    [tasks[0] ? tasks[0].started_at || null : 0, 0],
  );
}

//
// Check if step is failure. Only checks new tasks we just got from server. This might cause an issue
// though if we get successful tasks after getting failed ones (should not really happen).
//

export function getStepStatus(stepTaskData: Record<string, Task[]>): TaskStatus {
  for (const data of Object.entries(stepTaskData)) {
    const statuses = data[1].map((item) => item.status);
    const statusOfLastItem = statuses[statuses.length - 1];
    if (statusOfLastItem === 'running') {
      return 'running';
    }
    if (statusOfLastItem === 'failed') {
      return 'failed';
    }
  }
  return 'completed';
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
