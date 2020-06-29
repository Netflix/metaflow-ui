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

function rowDataReducer(state: { [key: string]: StepRowData }, action: RowDataAction): { [key: string]: StepRowData } {
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
      const data = action.data.reduce((obj: { [key: string]: StepRowData }, value) => {
        const existingObject = state[value.step_name];
        const isOpenValue = existingObject ? existingObject.isOpen : true;

        if (obj[value.step_name]) {
          const row = obj[value.step_name];
          return {
            ...obj,
            [value.step_name]: {
              isOpen: isOpenValue,
              finished_at:
                row.finished_at < value.finished_at || row.finished_at < value.ts_epoch
                  ? value.finished_at || value.ts_epoch
                  : row.finished_at,
              data: [...row.data, value],
            },
          };
        }

        return {
          ...obj,
          [value.step_name]: { isOpen: isOpenValue, finished_at: value.finished_at || value.ts_epoch, data: [value] },
        };
      }, {});

      return { ...state, ...data };
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

export default function useRowData() {
  const [rows, dispatch] = useReducer(rowDataReducer, {});

  return { rows, dispatch };
}
