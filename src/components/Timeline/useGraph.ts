import { useEffect, useReducer } from 'react';
import { QueryParamConfig, SetQuery, StringParam, useQueryParams } from 'use-query-params';

export type GraphAlignment = 'fromLeft' | 'fromStartTime';
export type GraphSortBy = 'startTime' | 'endTime' | 'duration';

export type GraphState = {
  // Relative or absolute rendering? Absolute = just line length
  alignment: GraphAlignment;
  // Sorting for tasks
  // Note that sorting works little differently depending on grouping. If we have grouping on, we sort
  // tasks within the steps. Else we sort tasks as one list.
  // NOTE: Should we sort steps as well?
  sortBy: GraphSortBy;
  // Sort direction
  sortDir: 'asc' | 'desc';
  // Minimum value in graph
  min: number;
  // Maximum length of graph
  max: number;
  // Selected starting point (default to 0)
  timelineStart: number;
  // Selected ending point (default to last task timestamp)
  timelineEnd: number;
  // Is zoom level user controlled?
  controlled: boolean;

  stepFilter: string[];
  statusFilter: string | null | undefined;
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
  | { type: 'setStatus'; status: string | null | undefined };

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'init': {
      if (state.controlled) {
        return {
          ...state,
          max: action.end,
          min: action.start,
          timelineStart: action.start > state.timelineStart ? action.start : state.timelineStart,
          timelineEnd: action.end < state.timelineEnd ? action.end : state.timelineEnd,
        };
      } else {
        return {
          ...state,
          max: action.end,
          min: action.start,
          timelineEnd: action.end,
          timelineStart: action.start,
          controlled: false,
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
      return { ...state, sortBy: action.by, alignment: action.by === 'duration' ? 'fromLeft' : 'fromStartTime' };

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
      return { ...state, timelineEnd: action.end, timelineStart: action.start, controlled: true };

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
  group: QueryParamConfig<string | null | undefined, string | null | undefined>;
  order: QueryParamConfig<string | null | undefined, string | null | undefined>;
  direction: QueryParamConfig<string | null | undefined, string | null | undefined>;
  steps: QueryParamConfig<string | null | undefined, string | null | undefined>;
  status: QueryParamConfig<string | null | undefined, string | null | undefined>;
};

//
// Hook to contain timelines graphical presentation data. We would not have to use hook here but
// we might need some extra functionality later so why not.
//
type GraphHook = { graph: GraphState; dispatch: React.Dispatch<GraphAction>; setQueryParam: SetQuery<QueryParameters> };

export default function useGraph(start: number, end: number): GraphHook {
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
  });

  //
  // Query parameters handling
  //

  const [q, sq] = useQueryParams({
    group: StringParam,
    order: StringParam,
    direction: StringParam,
    steps: StringParam,
    status: StringParam,
  });

  useEffect(() => {
    const sortDir = validatedParameter<'asc' | 'desc'>(q.direction, graph.sortDir, ['asc', 'desc'], 'asc');
    if (sortDir) {
      dispatch({
        type: 'sortDir',
        dir: sortDir,
      });
    }

    const sortBy = validatedParameter<'startTime' | 'endTime' | 'duration'>(
      q.order,
      graph.sortBy,
      ['startTime', 'endTime', 'duration'],
      'startTime',
    );

    if (sortBy) {
      dispatch({ type: 'sortBy', by: sortBy });
    }

    if (q.status !== graph.statusFilter) {
      dispatch({ type: 'setStatus', status: q.status });
    }
  }, [q, graph, dispatch]);

  useEffect(() => {
    dispatch({ type: 'setSteps', steps: q.steps });
  }, [q.steps]);

  return { graph, dispatch, setQueryParam: sq };
}
