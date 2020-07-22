//
// Row data handling
//

import { Task } from '../../types';
import { useReducer } from 'react';

export type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // We have to compute finished_at value so let it live in here now :(
  finished_at: number;
  // Tasks for this step
  data: Record<number, Task[]>;
};

export type RowDataAction =
  | { type: 'init'; ids: string[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'fill'; data: Task[] }
  | { type: 'toggle'; id: string }
  | { type: 'open'; id: string }
  | { type: 'close'; id: string }
  | { type: 'sort'; ids: string[] }
  | { type: 'reset' };

export type RowDataModel = { [key: string]: StepRowData };

function rowDataReducer(state: RowDataModel, action: RowDataAction): RowDataModel {
  switch (action.type) {
    case 'init':
      return action.ids.reduce((obj, id) => {
        if (state[id]) {
          return { ...obj, [id]: { ...state[id], isOpen: true } };
        }
        return { ...obj, [id]: { isOpen: true, data: [] } };
      }, {});
    case 'add':
      return { ...state, [action.id]: action.data };
    case 'fill': {
      // Group incoming tasks by step
      const groupped: Record<string, Task[]> = {};

      for (const row of action.data) {
        const step = row.step_name;

        if (groupped[step]) {
          groupped[step].push(row);
        } else {
          groupped[step] = [row];
        }
      }

      // And fill them to current state
      const newState = Object.keys(groupped).reduce((obj: RowDataModel, key: string): RowDataModel => {
        const row = obj[key];
        const newItems = groupped[key];
        const highestTime = latestTimeointOfTasks(newItems);

        if (row) {
          const newData = row.data;

          for (const item of newItems) {
            if (newData[item.task_id]) {
              const newtasks = newData[item.task_id];

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
              newData[item.task_id] = newtasks;
            } else {
              newData[item.task_id] = [item];
            }
          }

          return {
            ...obj,
            [key]: {
              ...row,
              finished_at: !row.finished_at || highestTime > row.finished_at ? highestTime : row.finished_at,
              data: newData,
            },
          };
        }

        return {
          ...obj,
          [key]: {
            isOpen: true,
            finished_at: highestTime,
            data: groupped[key].reduce<Record<number, Task[]>>((dataobj, item) => {
              if (dataobj[item.task_id]) {
                const newtasks = dataobj[item.task_id];

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
                return { ...dataobj, [item.task_id]: newtasks };
              } else {
                return { ...dataobj, [item.task_id]: [item] };
              }
            }, {}),
          },
        };
      }, state);

      return newState;
    } /*
    case 'sort':
      return Object.keys(state).reduce((obj, value) => {
        if (action.ids.indexOf(value) > -1) {
          return {
            ...obj,
            [value]: { ...state[value], data: state[value].data.sort((a, b) => a.ts_epoch - b.ts_epoch) },
          };
        }

        return obj;
      }, state);*/
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

function latestTimeointOfTasks(tasks: Task[]): number {
  return tasks.reduce((val, item) => {
    if (item.finished_at && item.finished_at > val) return item.finished_at;
    if (item.ts_epoch > val) return item.ts_epoch;
    return val;
  }, 0);
}

export default function useRowData(): { rows: RowDataModel; dispatch: React.Dispatch<RowDataAction> } {
  const [rows, dispatch] = useReducer(rowDataReducer, {});

  return { rows, dispatch };
}
