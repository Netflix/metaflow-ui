import { useEffect, useReducer } from 'react';
import {
  DecodedValueMap,
  QueryParamConfig,
  SetQuery,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

//
// useTaskListSettings is hook to handle extra settings for timeline and taskslist. Timeline does not require use of this.
// Hook has query parameter support baked in so changes to query params will get reflected to state
//

export type TasksSortBy = 'startTime' | 'endTime' | 'duration';
export type TaskListSort = [TasksSortBy, 'asc' | 'desc'];

export type TaskSettingsState = {
  // Sorting for tasks
  // Note that sorting works little differently depending on grouping. If we have grouping on, we sort
  // tasks within the steps. Else we sort tasks as one list.
  sort: TaskListSort;
  // Local step filters
  stepFilter: string[];
  // Local status filter
  statusFilter: string | null | undefined;
  // Enable grouping by step
  group: boolean;
  // Custom mode enabled:
  isCustomEnabled: boolean;
};

export type TaskSettingsAction =
  // Update sorting
  | { type: 'sort'; sort: TaskListSort }
  | { type: 'setSteps'; steps: string | null | undefined }
  | { type: 'setStatus'; status: string | null | undefined }
  | { type: 'setGrouping'; value: boolean }
  | { type: 'setCustom'; value: boolean };

export function taskListSettingsReducer(state: TaskSettingsState, action: TaskSettingsAction): TaskSettingsState {
  switch (action.type) {
    case 'sort':
      return {
        ...state,
        sort: action.sort,
      };

    case 'setSteps':
      if (action.steps) {
        return { ...state, stepFilter: action.steps.split(',') };
      }
      return { ...state, stepFilter: [] };

    case 'setStatus':
      return { ...state, statusFilter: action.status };

    case 'setGrouping':
      return { ...state, group: action.value };

    case 'setCustom':
      return { ...state, isCustomEnabled: action.value };
  }
  return state;
}

type PossibleParameterValue = string | number | undefined | null;

export function validatedParameter<X extends PossibleParameterValue>(
  value: PossibleParameterValue,
  currentValue: PossibleParameterValue,
  allowed: X[],
  defaultValue: X,
): X | null {
  if (!value && currentValue !== defaultValue) {
    return defaultValue;
  } else if (value && value !== currentValue && !!allowed.find((aval) => aval === value)) {
    return value as X;
  }

  return null;
}

export type TaskSettingsQueryParameters = {
  group: QueryParamConfig<string | null | undefined, string>;
  order: QueryParamConfig<string | null | undefined, string | null | undefined>;
  direction: QueryParamConfig<string | null | undefined, string | null | undefined>;
  steps: QueryParamConfig<string | null | undefined, string | null | undefined>;
  status: QueryParamConfig<string | null | undefined, string | null | undefined>;
};

export type TaskSettingsParametersMap = DecodedValueMap<TaskSettingsQueryParameters>;

export type TaskSettingsHook = {
  settings: TaskSettingsState;
  dispatch: React.Dispatch<TaskSettingsAction>;
  setQueryParam: SetQuery<TaskSettingsQueryParameters>;
  params: TaskSettingsParametersMap;
  setMode: (mode: TaskListMode) => void;
};

export const OverviewMode = {
  order: 'startTime',
  direction: 'asc',
  status: null,
  group: 'true',
};

export const MonitoringMode = {
  order: 'startTime',
  direction: 'desc',
  status: null,
  group: 'false',
};

export const ErrorTrackerMode = {
  order: 'startTime',
  direction: 'asc',
  status: 'failed',
  group: 'true',
};

type Param = string | undefined | null;

function equalsDefaultMode(order: Param, dir: Param, status: Param, group: Param): boolean {
  // If we don't have any params, we just arrived to the page and we don't want to detect default
  // mode yet
  if (!order && !dir && !status) {
    return false;
  }
  return !![OverviewMode, MonitoringMode, ErrorTrackerMode].find(
    (mode) =>
      mode.order === order && mode.direction === dir && mode.status === (status || null) && mode.group === group,
  );
}

export type TaskListMode = 'overview' | 'monitoring' | 'error-tracker' | 'custom';

export default function useTaskListSettings(): TaskSettingsHook {
  const [taskListSettings, dispatch] = useReducer(taskListSettingsReducer, {
    sort: ['startTime', 'asc'],
    stepFilter: [],
    statusFilter: null,
    group: true,
    isCustomEnabled: false,
  });

  //
  // Query parameters handling
  //

  const [q, sq] = useQueryParams({
    group: withDefault(StringParam, 'true'),
    order: StringParam,
    direction: StringParam,
    steps: StringParam,
    status: StringParam,
  });

  useEffect(() => {
    // Check sort direction param, only update if is valid and changed
    const sortDir = validatedParameter<'asc' | 'desc'>(q.direction, taskListSettings.sort[0], ['asc', 'desc'], 'asc');
    // Check sort by param, only update if is valid and changed
    const sortBy = validatedParameter<'startTime' | 'endTime' | 'duration'>(
      q.order,
      taskListSettings.sort[1],
      ['startTime', 'endTime', 'duration'],
      'startTime',
    );

    if (sortDir || sortBy) {
      dispatch({ type: 'sort', sort: [sortBy || taskListSettings.sort[0], sortDir || taskListSettings.sort[1]] });
    }

    // Check status param, only update if is valid and changed
    if (q.status !== taskListSettings.statusFilter) {
      dispatch({ type: 'setStatus', status: q.status });
    }

    // Check grouping param, only update if is valid and changed
    const group = validatedParameter<'true' | 'false'>(
      q.group,
      taskListSettings.group ? 'true' : 'false',
      ['true', 'false'],
      'true',
    );
    if (group) {
      dispatch({ type: 'setGrouping', value: group === 'true' ? true : false });
    }

    // Check if we were in custom mode, if so we need to save change to localstorage as well
    if (taskListSettings.isCustomEnabled) {
      const { steps, ...rest } = q;
      localStorage.setItem('custom-settings', JSON.stringify(rest));
    } else {
      // If we changed something and we now differ from default settings, we need to set
      // custom mode on and start saving settingin localstorage
      if (!equalsDefaultMode(q.order, q.direction, q.status, q.group)) {
        const { steps, ...rest } = q;
        dispatch({ type: 'setCustom', value: true });
        localStorage.setItem('custom-settings', JSON.stringify(rest));
      }
    }
  }, [
    q,
    dispatch,
    taskListSettings.isCustomEnabled,
    taskListSettings.group,
    taskListSettings.statusFilter,
    taskListSettings.sort,
  ]);

  useEffect(() => {
    dispatch({ type: 'setSteps', steps: q.steps });
  }, [q.steps]);

  // Update active settings mode for task listing.
  const setMode = (mode: TaskListMode) => {
    if (mode === 'overview') {
      sq({ ...q, ...OverviewMode }, 'replace');
      dispatch({ type: 'setCustom', value: false });
    } else if (mode === 'monitoring') {
      sq({ ...q, ...MonitoringMode }, 'replace');
      dispatch({ type: 'setCustom', value: false });
    } else if (mode === 'error-tracker') {
      sq({ ...q, ...ErrorTrackerMode }, 'replace');
      dispatch({ type: 'setCustom', value: false });
    } else if (mode === 'custom') {
      dispatch({ type: 'setCustom', value: true });
      // Check previous settings from localstorage for custom setting
      const previousSettings = localStorage.getItem('custom-settings');
      if (previousSettings) {
        const parsed = JSON.parse(previousSettings);
        if (parsed) {
          const steps = q.steps ? { steps: q.steps } : {};
          sq({ ...parsed, ...steps }, 'replace');
        }
      }
    }
  };

  return { settings: taskListSettings, dispatch, setQueryParam: sq, params: q, setMode };
}
