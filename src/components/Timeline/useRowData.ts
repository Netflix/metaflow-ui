//
// Row data handling
//

import { Task, Step, AsyncStatus } from '../../types';
import { useEffect, useReducer, useState } from 'react';
import useResource from '../../hooks/useResource';

export type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // We have to compute finished_at value so let it live in here now :(
  finished_at: number;
  duration: number;
  isFailed: boolean;
  step?: Step;
  // Tasks for this step
  data: Record<string, Task[]>;
};

export type StepLineData = {
  started_at: number;
  finished_at: number;
  isFailed: boolean;
  step_name: string;
  original?: Step;
};

export type RowDataAction =
  | { type: 'fillStep'; data: Step[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'fillTasks'; data: Task[] }
  | { type: 'toggle'; id: string }
  | { type: 'open'; id: string }
  | { type: 'close'; id: string }
  | { type: 'openAll' }
  | { type: 'closeAll' }
  | { type: 'sort'; ids: string[] }
  | { type: 'reset' };

export type RowDataModel = { [key: string]: StepRowData };

export function rowDataReducer(state: RowDataModel, action: RowDataAction): RowDataModel {
  switch (action.type) {
    case 'fillStep':
      const steprows: RowDataModel = action.data.reduce((obj: RowDataModel, step: Step) => {
        const existingRow = obj[step.step_name];
        if (existingRow) {
          return {
            ...obj,
            [step.step_name]: {
              ...existingRow,
              step: step,
              isOpen: true,
              duration:
                existingRow.duration === existingRow.finished_at - step.ts_epoch
                  ? existingRow.duration
                  : existingRow.finished_at - step.ts_epoch,
            },
          };
        }
        return {
          ...obj,
          [step.step_name]: { step: step, isOpen: true, isFailed: false, finished_at: 0, duration: 0, data: {} },
        };
      }, state);
      return Object.keys(steprows)
        .sort((a, b) => {
          const astep = steprows[a];
          const bstep = steprows[b];
          return (astep.step?.ts_epoch || 0) - (bstep.step?.ts_epoch || 0);
        })
        .reduce((obj, key) => {
          return { ...obj, [key]: steprows[key] };
        }, {});
    case 'add':
      return { ...state, [action.id]: action.data };
    case 'fillTasks': {
      // Group incoming tasks by step
      const grouped: Record<string, Task[]> = {};

      for (const row of action.data) {
        const step = row.step_name;

        if (grouped[step]) {
          grouped[step].push(row);
          // Make sure that we process attempts in correct attempt order. This is important when we try to figure out
          // start time and duration
          grouped[step] = grouped[step].sort((a, b) => a.attempt_id - b.attempt_id);
        } else {
          grouped[step] = [row];
        }
      }

      // And fill them to current state
      const newState = Object.keys(grouped).reduce((obj: RowDataModel, key: string): RowDataModel => {
        const row = obj[key];
        const newItems = grouped[key];
        const [startTime, endTime] = timepointsOfTasks(newItems);
        // Existing step entry
        if (row) {
          const newData = row.data;

          for (const item of newItems) {
            newData[item.task_id] = createNewStepRowTasks(newData, item);
          }

          const newEndTime = !row.finished_at || endTime > row.finished_at ? endTime : row.finished_at;
          return {
            ...obj,
            [key]: {
              ...row,
              isFailed: isFailedStep(newData, newItems),
              finished_at: newEndTime,
              duration: row.step ? newEndTime - row.step.ts_epoch : row.duration,
              data: newData,
            },
          };
        }
        // New step entry
        return {
          ...obj,
          [key]: {
            isOpen: true,
            isFailed: isFailedStep(grouped, newItems),
            finished_at: endTime,
            duration: endTime - startTime,
            data: grouped[key].reduce<Record<number, Task[]>>((dataobj, item) => {
              return { ...dataobj, [item.task_id]: createNewStepRowTasks(dataobj, item) };
            }, {}),
          },
        };
      }, state);

      return newState;
    }
    case 'toggle':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: !state[action.id].isOpen } };
      }
      return state;
    case 'open':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: true } };
      }
      return state;
    case 'close':
      if (state[action.id]) {
        return { ...state, [action.id]: { ...state[action.id], isOpen: false } };
      }
      return state;
    case 'openAll':
      return Object.keys(state).reduce((obj, current) => {
        return { ...obj, [current]: { ...obj[current], isOpen: true } };
      }, state);
    case 'closeAll':
      return Object.keys(state).reduce((obj, current) => {
        return { ...obj, [current]: { ...obj[current], isOpen: false } };
      }, state);
    case 'reset':
      return {};
  }

  return state;
}

/**
 * Check if step is failure. Only checks new tasks we just got from server. This might cause an issue
 * though if we get successful tasks after getting failed ones (should not really happen).
 */
function isFailedStep(stepTaskData: Record<string, Task[]>, newTasks: Task[]) {
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

/**
 * Merge or add new data to row information.
 * If there already was data about same TASK but it doesnt have finished_at value, we
 * replace it.
 */
export function createNewStepRowTasks(currentData: Record<string, Task[]>, item: Task): Task[] {
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

    let added = false;
    for (const index in newtasks) {
      if (newtasks[index].attempt_id === item.attempt_id) {
        added = true;
        newtasks[index] = item;
      }
    }

    if (!added) {
      newtasks.push(item);
    }
    return newtasks;
  } else {
    return [item];
  }
}

export function timepointsOfTasks(tasks: Task[]): [number, number] {
  return tasks.reduce(
    (val, task) => {
      const highpoint: number =
        task.finished_at && task.finished_at > val[1]
          ? task.finished_at
          : task.ts_epoch > val[1]
          ? task.ts_epoch
          : val[1];
      const lowpoint: number = task.ts_epoch < val[0] ? task.ts_epoch : val[0];
      return [lowpoint, highpoint];
    },
    [tasks[0] ? tasks[0].ts_epoch : 0, 0],
  );
}

export type RowCounts = {
  all: number;
  completed: number;
  running: number;
  failed: number;
};

export default function useRowData(
  flowId: string,
  runNumber: string,
): {
  rows: RowDataModel;
  dispatch: React.Dispatch<RowDataAction>;
  taskStatus: AsyncStatus;
  counts: RowCounts;
  steps: StepLineData[];
  isAnyGroupOpen: boolean;
} {
  const [rows, dispatch] = useReducer(rowDataReducer, {});

  // Fetch & subscribe to steps
  useResource<Step[], Step>({
    url: encodeURI(`/flows/${flowId}/runs/${runNumber}/steps`),
    subscribeToEvents: true,
    initialData: [],
    onUpdate: (items) => {
      dispatch({ type: 'fillStep', data: items });
    },
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fullyDisableCache: true,
  });

  // Fetch & subscribe to tasks
  const { status: taskStatus } = useResource<Task[], Task>({
    url: encodeURI(`/flows/${flowId}/runs/${runNumber}/tasks`),
    subscribeToEvents: true,
    initialData: [],
    updatePredicate: (a, b) => a.task_id === b.task_id,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '200',
    },
    fetchAllData: true,
    onUpdate: (items) => {
      dispatch({ type: 'fillTasks', data: items });
    },
    fullyDisableCache: true,
    useBatching: true,
  });

  //
  // Counts
  //
  const [counts, setCounts] = useState<RowCounts>({ all: 0, completed: 0, running: 0, failed: 0 });

  useEffect(() => {
    const newCounts = {
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

          newCounts.all++;
          if (allStatuses.indexOf('completed') > -1) {
            newCounts.completed++;
          } else if (allStatuses.indexOf('running') > -1) {
            newCounts.running++;
          }
          // If there is more than 1 task on one row, there must be multiple attempts which means that some
          // of them has failed
          if (allStatuses.indexOf('failed') > -1 || taskRow.length > 1) {
            newCounts.failed++;
          }
        }
      }
    }

    setCounts(newCounts);
  }, [rows]);

  const steps: StepLineData[] = Object.keys(rows).reduce((arr: StepLineData[], key) => {
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

  const anyOpen = !!Object.keys(rows).find((key) => rows[key].isOpen);

  return { rows, dispatch, taskStatus, counts, steps, isAnyGroupOpen: anyOpen };
}
