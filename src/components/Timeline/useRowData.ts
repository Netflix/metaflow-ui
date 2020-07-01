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
  data: Task[];
};

type RowDataAction =
  | { type: 'init'; ids: string[] }
  | { type: 'add'; id: string; data: StepRowData }
  | { type: 'fill'; data: Task[] }
  | { type: 'toggle'; id: string }
  | { type: 'open'; id: string }
  | { type: 'close'; id: string }
  | { type: 'sort'; ids: string[] };

type RowDataModel = { [key: string]: StepRowData };

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
      const groupped = action.data.reduce((obj: { [key: string]: Task[] }, value) => {
        const step = value.step_name;

        if (obj[step]) return { ...obj, [step]: [...obj[step], value] };

        return { ...obj, [step]: [value] };
      }, {});
      // And fill them to current state
      const newState = Object.keys(groupped).reduce((obj: RowDataModel, key: string): RowDataModel => {
        const row = obj[key];
        const newItems = groupped[key];
        const highestTime = latestTimeointOfTasks(newItems);

        if (row) {
          const newData = [...row.data];
          const existingIds = row.data.map((item) => item.task_id);

          for (const item of newItems) {
            const itemIndex = existingIds.indexOf(item.task_id);
            if (itemIndex > -1) {
              newData[itemIndex] = item;
            } else {
              newData.push(item);
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
            data: groupped[key],
          },
        };
      }, state);

      return newState;
    }
    case 'sort':
      return Object.keys(state).reduce((obj, value) => {
        if (action.ids.indexOf(value) > -1) {
          return {
            ...obj,
            [value]: { ...state[value], data: state[value].data.sort((a, b) => a.ts_epoch - b.ts_epoch) },
          };
        }

        return obj;
      }, state);
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
