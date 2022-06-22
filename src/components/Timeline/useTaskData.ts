import { useCallback, useEffect, useReducer, useState } from 'react';
import { Task, Step, AsyncStatus, APIError, TaskStatus } from '../../types';
import useResource, { DataModel } from '../../hooks/useResource';
import {
  countTaskRowsByStatus,
  getStepStatus,
  makeStepLineData,
  makeTasksForStep,
  RowCounts,
  StepLineData,
  timepointsOfTasks,
} from './taskdataUtils';
import { apiHttp } from '../../constants';

//
// useTaskData hook is responsible of fetching all step and task data for given run. It automatically
// fetches, and receives all realtime updates from server.
//
// Task data is grouped by steps
//

export type StepRowData = {
  // Is row opened?
  isOpen: boolean;
  // We have to compute finished_at value so let it live in here now :(
  finished_at: number;
  duration: number;
  status: TaskStatus;
  step?: Step;
  // Tasks for this step
  data: Record<string, Task[]>;
  tasksTotal?: number;
  tasksVisible?: number;
};

const emptyArray: Step[] = [];
const emptyArray2: Task[] = [];

//
// Reducer
//

export type RowDataAction =
  // Add steps to the store
  | { type: 'fillStep'; data: Step[] }
  // Fill bunch of tasks to the corresponding step
  | { type: 'fillTasks'; data: Task[] }
  // Toggle step row expanded or collapsed
  | { type: 'toggle'; id: string }
  // Expand step row
  | { type: 'open'; id: string }
  // Collapse step row
  | { type: 'close'; id: string }
  // Expand all steps
  | { type: 'openAll' }
  // Collapse all steps
  | { type: 'closeAll' }
  | { type: 'reset' };

export type RowDataModel = { [key: string]: StepRowData };

export function rowDataReducer(state: RowDataModel, action: RowDataAction): RowDataModel {
  switch (action.type) {
    case 'fillStep':
      // We got new step data. Add step objects BUT check if they already exists. Might happen if
      // Tasks requests is ready before step request.
      const steprows: RowDataModel = action.data.reduce((obj: RowDataModel, step: Step) => {
        const existingRow = obj[step.step_name];
        // If step object already exists, only add step data and calculate duration
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
        // Else initialise empty step row object
        return {
          ...obj,
          [step.step_name]: {
            step: step,
            isOpen: true,
            status: 'unknown' as TaskStatus,
            finished_at: 0,
            duration: 0,
            data: {},
          },
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
            newData[item.task_id] = makeTasksForStep(newData, item);
          }

          const newEndTime = !row.finished_at || endTime > row.finished_at ? endTime : row.finished_at;
          return {
            ...obj,
            [key]: {
              ...row,
              status: getStepStatus(newData),
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
            status: getStepStatus(grouped),
            finished_at: endTime,
            duration: startTime ? endTime - startTime : 0,
            data: grouped[key].reduce<Record<number, Task[]>>((dataobj, item) => {
              return { ...dataobj, [item.task_id]: makeTasksForStep(dataobj, item) };
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

//
// Hook
//

export type useTaskDataHook = {
  rows: RowDataModel;
  dispatch: React.Dispatch<RowDataAction>;
  taskStatus: AsyncStatus;
  counts: RowCounts;
  steps: StepLineData[];
  isAnyGroupOpen: boolean;
  taskError: APIError | null;
  stepError: APIError | null;
};

export default function useTaskData(flowId: string, runNumber: string): useTaskDataHook {
  const [rows, dispatch] = useReducer(rowDataReducer, {});

  const onStepUpdate = useCallback((items) => {
    dispatch({ type: 'fillStep', data: items });
  }, []);

  // Fetch & subscribe to steps
  const { error: stepError } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${flowId}/runs/${runNumber}/steps`),
    subscribeToEvents: true,
    initialData: emptyArray,
    onUpdate: onStepUpdate,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  const onUpdate = useCallback((items: Task[]) => {
    dispatch({
      type: 'fillTasks',
      data: items.map((item) => ({ ...item, status: item.status === 'unknown' ? 'refining' : item.status })),
    });
  }, []);

  const postRequest = useCallback(
    (success: boolean, _target: string, result: DataModel<Task[]> | undefined) => {
      if (success && result) {
        const tasksNeedingRefine = result.data
          .filter((task) => task.status === 'unknown' && task.step_name !== '_parameters')
          .map((task) => task.task_id);

        if (tasksNeedingRefine.length > 0) {
          const target = apiHttp(
            `/flows/${flowId}/runs/${runNumber}/tasks?taskId=${tasksNeedingRefine.join(
              ',',
            )}&postprocess=true&_limit=500`,
          );

          fetch(target)
            .then((response) => response.json())
            .then((response: DataModel<Task[]>) => {
              if (response?.status === 200) {
                dispatch({ type: 'fillTasks', data: response.data });
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
      }
    },
    [flowId, runNumber],
  );

  // Fetch & subscribe to tasks
  const { status: taskStatus, error: taskError } = useResource<Task[], Task>({
    url: encodeURI(`/flows/${flowId}/runs/${runNumber}/tasks`),
    subscribeToEvents: true,
    initialData: emptyArray2,
    updatePredicate: (a, b) => a.task_id === b.task_id,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
      postprocess: 'false',
    },
    socketParamFilter: ({ postprocess, ...rest }) => {
      return rest;
    },
    fetchAllData: true,
    onUpdate,
    postRequest,
    useBatching: true,
  });

  //
  // Counts & steps data
  //
  const [counts, setCounts] = useState<RowCounts>({
    all: 0,
    completed: 0,
    running: 0,
    failed: 0,
    unknown: 0,
    pending: 0,
  });
  const [steps, setStepLines] = useState<StepLineData[]>([]);
  const [anyOpen, setAnyOpen] = useState<boolean>(true);

  useEffect(() => {
    setCounts(countTaskRowsByStatus(rows));
    setStepLines(makeStepLineData(rows));
    setAnyOpen(!!Object.keys(rows).find((key) => rows[key].isOpen));
  }, [rows]);

  return { rows, dispatch, taskStatus, counts, steps, isAnyGroupOpen: anyOpen, taskError, stepError };
}
