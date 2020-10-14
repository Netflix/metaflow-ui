//
// Row data handling
//

import { Task, Step } from '../../types';
import { useReducer } from 'react';

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

export default function useRowData(): { rows: RowDataModel; dispatch: React.Dispatch<RowDataAction> } {
  const [rows, dispatch] = useReducer(rowDataReducer, {});

  return { rows, dispatch };
}
