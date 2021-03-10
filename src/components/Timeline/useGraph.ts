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
// useGraph is responsible for tracking timeline metrics and parameters for constructing actual rows.
//

export type GraphAlignment = 'fromLeft' | 'fromStartTime';
export type GraphSortBy = 'startTime' | 'endTime' | 'duration';

export type GraphState = {
  // Alignment for graphics in line. It's from left or from actual start position of attempt
  alignment: GraphAlignment;
  // Sorting for tasks
  // Note that sorting works little differently depending on grouping. If we have grouping on, we sort
  // tasks within the steps. Else we sort tasks as one list.
  sortBy: GraphSortBy;
  // Sort direction
  sortDir: 'asc' | 'desc';
  // Minimum timestamp in graph. This is starting point
  min: number;
  // Maximum timestamp of graph. This is ending point
  max: number;
  // Selected starting point. This is start of the visible section.
  timelineStart: number;
  // Selected ending point. This is end of the visible section.
  timelineEnd: number;
  // If user has zoomed in, we don't want to update zoom status when new updates come in.
  controlled: boolean;
  // Local step filters
  stepFilter: string[];
  // Local status filter
  statusFilter: string | null | undefined;
  // Enable grouping by step
  group: boolean;
  // Custom mode enabled:
  isCustomEnabled: boolean;
  // Checked when switching order by so we dont keep zoomed state.
  resetToFullview: boolean;
};

export type GraphAction =
  // Set min and max values for timeline and set zoom to full
  | { type: 'init'; start: number; end: number }
  // Move timeline to backwards or forward. (minus value to move backwards)
  | { type: 'move'; value: number }
  // Update maximum length of timeline (needed when new items comes from websocket)
  | { type: 'updateMax'; end: number }
  // Update active alignment which defines where should lines start.
  | { type: 'alignment'; alignment: GraphAlignment }
  // Update sorting method
  | { type: 'sortBy'; by: GraphSortBy }
  // Update sorting direction
  | { type: 'sortDir'; dir: 'asc' | 'desc' }
  // Zoom functions manipulates timelineStart and timelineEnd values to kinda fake zooming.
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'setZoom'; start: number; end: number }
  | { type: 'resetZoom' }
  | { type: 'reset' }
  // Update zoom contol state. If controlled, we dont update zoom level.
  | { type: 'setControlled'; value: boolean }
  | { type: 'setSteps'; steps: string | null | undefined }
  | { type: 'setStatus'; status: string | null | undefined }
  | { type: 'setGrouping'; value: boolean }
  | { type: 'setCustom'; value: boolean }
  | { type: 'incrementTimelineLength' };

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'init': {
      const end = state.max > action.end ? state.max : action.end;
      if (state.controlled && !state.resetToFullview) {
        return {
          ...state,
          max: end,
          min: action.start,
          timelineStart: action.start > state.timelineStart ? action.start : state.timelineStart,
          timelineEnd: end < state.timelineEnd ? end : state.timelineEnd,
        };
      } else {
        return {
          ...state,
          max: state.sortBy === 'duration' ? action.end : end,
          min: action.start,
          timelineEnd: state.sortBy === 'duration' ? action.end : end,
          timelineStart: action.start,
          controlled: false,
          resetToFullview: false,
        };
      }
    }
    case 'move':
      // Check if any of the edges of scroll bar are out of bounds
      if (startOrEndOutOfBounds(state, action.value)) {
        return {
          ...state,
          timelineStart: startOutOfBounds(state, action.value)
            ? state.min
            : state.max - (state.timelineEnd - state.timelineStart),
          timelineEnd: endOutOfBounds(state, action.value)
            ? state.max
            : state.min + (state.timelineEnd - state.timelineStart),
        };
      } else {
        // Other wise just change start and end position of scrollbar
        return updateGraph(state, action.value);
      }

    case 'updateMax':
      return {
        ...state,
        max: action.end,
        timelineEnd: state.controlled ? (action.end < state.timelineEnd ? action.end : state.timelineEnd) : action.end,
      };

    case 'alignment':
      return { ...state, alignment: action.alignment };

    case 'sortBy':
      return {
        ...state,
        sortBy: action.by,
        alignment: action.by === 'duration' ? 'fromLeft' : 'fromStartTime',
        resetToFullview: true,
      };

    case 'sortDir':
      return { ...state, sortDir: action.dir };

    case 'zoomIn': {
      const change = getZoomAmount(state);

      if (state.timelineEnd - change <= state.timelineStart + change) return state;

      return { ...updateGraph(state, change, -change), controlled: true };
    }

    case 'zoomOut': {
      const change = getZoomAmount(state);

      if (zoomOverTotalLength(state, change)) {
        return resetTimeline(state);
      } else if (startOrEndOutOfBounds(state, -change, change)) {
        return {
          ...state,
          timelineStart: startOutOfBounds(state, -change)
            ? state.min
            : state.max - (state.timelineEnd - state.timelineStart + change),
          timelineEnd: endOutOfBounds(state, change)
            ? state.max
            : state.min + (state.timelineEnd - state.timelineStart + change),
        };
      } else {
        return updateGraph(state, -change, change);
      }
    }

    case 'setZoom':
      const newVals = {
        timelineEnd: action.end <= action.start ? action.start : action.end,
        timelineStart: action.start >= action.end ? action.end : action.start,
      };

      return {
        ...state,
        ...newVals,
        controlled: newVals.timelineEnd - newVals.timelineStart >= (state.max - state.min) * 0.97 ? false : true,
      };

    case 'resetZoom':
      return resetTimeline(state);

    case 'setControlled':
      return { ...state, controlled: action.value };

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

    case 'incrementTimelineLength':
      return {
        ...state,
        max: new Date().getTime(),
        timelineEnd: state.controlled ? state.timelineEnd : new Date().getTime(),
      };

    case 'reset':
      return { ...state, controlled: false, min: 0, max: 0, timelineStart: 0, timelineEnd: 0 };
  }
  return state;
}

/**
 * Returns amount we need to zoom in or out. IF current visible section is less than 21% of total length we zoom
 * in or out only small amount. Else much more.
 * @param state State of current graph
 */
export function getZoomAmount(state: GraphState): number {
  const currentVisiblePortion = (state.timelineEnd - state.timelineStart) / (state.max - state.min);
  return currentVisiblePortion < 0.21 ? (state.max - state.min) / 50 : (state.max - state.min) / 10;
}

/**
 * When if tried zoom is bigger than total length of timeline (might happen on zoom out)
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function zoomOverTotalLength(graph: GraphState, change: number): boolean {
  return graph.timelineEnd + change - (graph.timelineStart - change) >= graph.max - graph.min;
}

/**
 * Check if scrollbar is going backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function startOutOfBounds(graph: GraphState, change: number): boolean {
  return graph.timelineStart + change < graph.min;
}

/**
 * Check if scrollbar is going forward too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function endOutOfBounds(graph: GraphState, change: number): boolean {
  return graph.timelineEnd + change > graph.max;
}

/**
 * Check if scrollbar is going forward and backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 * @param changeEnd We might want to move and value different direction than start (zoom events)
 */
export function startOrEndOutOfBounds(graph: GraphState, change: number, changeEnd?: number): boolean {
  return startOutOfBounds(graph, change) || endOutOfBounds(graph, changeEnd || change);
}

export function updateGraph(graph: GraphState, change: number, changeEnd?: number): GraphState {
  return {
    ...graph,
    timelineStart: graph.timelineStart + change,
    timelineEnd: graph.timelineEnd + (changeEnd || change),
  };
}

export function resetTimeline(graph: GraphState): GraphState {
  return {
    ...graph,
    timelineStart: graph.min,
    timelineEnd: graph.max,
    controlled: false,
  };
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

type QueryParameters = {
  group: QueryParamConfig<string | null | undefined, string>;
  order: QueryParamConfig<string | null | undefined, string | null | undefined>;
  direction: QueryParamConfig<string | null | undefined, string | null | undefined>;
  steps: QueryParamConfig<string | null | undefined, string | null | undefined>;
  status: QueryParamConfig<string | null | undefined, string | null | undefined>;
};

//
// Hook to contain timelines graphical presentation data. We would not have to use hook here but
// we might need some extra functionality later so why not.
//
export type GraphHook = {
  graph: GraphState;
  dispatch: React.Dispatch<GraphAction>;
  setQueryParam: SetQuery<QueryParameters>;
  params: DecodedValueMap<QueryParameters>;
  setMode: (mode: GraphMode) => void;
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

export type GraphMode = 'overview' | 'monitoring' | 'error-tracker' | 'custom';

export default function useGraph(start: number, end: number, autoIncrement: boolean): GraphHook {
  const [graph, dispatch] = useReducer(graphReducer, {
    alignment: 'fromStartTime',
    sortBy: 'startTime',
    sortDir: 'asc',
    min: start,
    max: end,
    timelineStart: start,
    timelineEnd: end,
    controlled: false,

    stepFilter: [],
    statusFilter: null,
    group: true,
    isCustomEnabled: false,
    resetToFullview: false,
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
    const sortDir = validatedParameter<'asc' | 'desc'>(q.direction, graph.sortDir, ['asc', 'desc'], 'asc');
    if (sortDir) {
      dispatch({ type: 'sortDir', dir: sortDir });
    }
    // Check sort by param, only update if is valid and changed
    const sortBy = validatedParameter<'startTime' | 'endTime' | 'duration'>(
      q.order,
      graph.sortBy,
      ['startTime', 'endTime', 'duration'],
      'startTime',
    );

    if (sortBy) {
      dispatch({ type: 'sortBy', by: sortBy });
    }

    // Check status param, only update if is valid and changed
    if (q.status !== graph.statusFilter) {
      dispatch({ type: 'setStatus', status: q.status });
    }

    // Check grouping param, only update if is valid and changed
    const group = validatedParameter<'true' | 'false'>(
      q.group,
      graph.group ? 'true' : 'false',
      ['true', 'false'],
      'true',
    );
    if (group) {
      dispatch({ type: 'setGrouping', value: group === 'true' ? true : false });
    }

    // Check if we were in custom mode, if so we need to save change to localstorage as well
    if (graph.isCustomEnabled) {
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
  }, [q, dispatch]); // eslint-disable-line

  useEffect(() => {
    dispatch({ type: 'setSteps', steps: q.steps });
  }, [q.steps]);

  // Update active settings mode for task listing.
  const setMode = (mode: GraphMode) => {
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

  useEffect(() => {
    const tm = setInterval(() => {
      if (autoIncrement && graph.sortBy !== 'duration') {
        dispatch({ type: 'incrementTimelineLength' });
      }
    }, 1000);

    return () => clearInterval(tm);
  }, [graph.sortBy, autoIncrement]);

  return { graph, dispatch, setQueryParam: sq, params: q, setMode };
}
