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
  step?: Step;
  // Tasks for this step
  data: Record<string, Task[]>;
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
        if (obj[step.step_name]) {
          return { ...obj, [step.step_name]: { ...state[step.step_name], step: step, isOpen: true } };
        }
        return { ...obj, [step.step_name]: { step: step, isOpen: true, finished_at: 0, duration: 0, data: {} } };
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
        } else {
          grouped[step] = [row];
        }
      }

      // And fill them to current state
      const newState = Object.keys(grouped).reduce((obj: RowDataModel, key: string): RowDataModel => {
        const row = obj[key];
        const newItems = grouped[key];
        const [startTime, endTime] = timepointsOfTasks(newItems);

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
              finished_at: newEndTime,
              duration: row.step ? newEndTime - row.step.ts_epoch : row.duration,
              data: newData,
            },
          };
        }

        return {
          ...obj,
          [key]: {
            isOpen: true,
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
 * Merge or add new data to row information.
 * If there already was data about same TASK but it doesnt have finished_at value, we
 * replace it.
 */
export function createNewStepRowTasks(currentData: Record<string, Task[]>, item: Task): Task[] {
  if (currentData[item.task_id]) {
    const newtasks = currentData[item.task_id];

    let added = false;
    for (const index in newtasks) {
      if (!newtasks[index].finished_at || newtasks[index].finished_at === item.finished_at) {
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
  steps: Step[];
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

  const steps: Step[] = Object.keys(rows)
    .map((key) => {
      const step = rows[key].step;
      return step ? ({ ...step, finished_at: step?.finished_at || rows[key].finished_at } as Step) : null;
    })
    .filter((t): t is Step => !!t);

  return { rows, dispatch, taskStatus, counts, steps };
}
