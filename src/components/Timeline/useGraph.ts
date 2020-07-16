import { useReducer } from 'react';

export type GraphAlignment = 'fromLeft' | 'fromStartTime';
export type GraphGroupBy = 'step' | 'none';
export type GraphSortBy = 'startTime' | 'duration';

export type GraphState = {
  // Relative or absolute rendering? Absolute = just line length
  alignment: GraphAlignment;
  // Groupped by
  groupBy: GraphGroupBy;
  // Sorting for tasks
  sortBy: GraphSortBy;
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
  // Update group by method
  | { type: 'groupBy'; by: GraphGroupBy }
  // Update sorting method
  | { type: 'sortBy'; by: GraphSortBy }
  // Zoom functions manipulates timelineStart and timelineEnd values to kinda fake zooming.
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'resetZoom' }
  | { type: 'reset' }
  // Update zoom contol state. If controlled, we dont update zoom level.
  | { type: 'setControlled'; value: boolean };

function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'init':
      return {
        ...state,
        max: action.end,
        min: action.start,
        timelineEnd: action.end,
        timelineStart: action.start,
        controlled: false,
      };

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
      const val = action.end > state.max ? action.end : state.max;
      return { ...state, max: val, timelineEnd: state.controlled ? state.timelineEnd : val };

    case 'alignment':
      return { ...state, alignment: action.alignment };

    case 'groupBy':
      return { ...state, groupBy: action.by };

    case 'sortBy':
      return { ...state, sortBy: action.by };

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

    case 'resetZoom':
      return resetTimeline(state);

    case 'setControlled':
      return { ...state, controlled: action.value };

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
function getZoomAmount(state: GraphState) {
  const currentVisiblePortion = (state.timelineEnd - state.timelineStart) / (state.max - state.min);
  return currentVisiblePortion < 0.21 ? (state.max - state.min) / 50 : (state.max - state.min) / 10;
}

/**
 * When if tried zoom is bigger than total length of timeline (might happen on zoom out)
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
function zoomOverTotalLength(graph: GraphState, change: number) {
  return graph.timelineEnd + change - (graph.timelineStart - change) >= graph.max - graph.min;
}

/**
 * Check if scrollbar is going backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
function startOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineStart + change < graph.min;
}

/**
 * Check if scrollbar is going forward too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
function endOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineEnd + change > graph.max;
}

/**
 * Check if scrollbar is going forward and backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 * @param changeEnd We might want to move and value different direction than start (zoom events)
 */
function startOrEndOutOfBounds(graph: GraphState, change: number, changeEnd?: number) {
  return startOutOfBounds(graph, change) || endOutOfBounds(graph, changeEnd || change);
}

function updateGraph(graph: GraphState, change: number, changeEnd?: number): GraphState {
  return {
    ...graph,
    timelineStart: graph.timelineStart + change,
    timelineEnd: graph.timelineEnd + (changeEnd || change),
  };
}

function resetTimeline(graph: GraphState): GraphState {
  return {
    ...graph,
    timelineStart: graph.min,
    timelineEnd: graph.max,
    controlled: false,
  };
}

//
// Hook to contain timelines graphical presentation data. We would not have to use hook here but
// we might need some extra functionality later so why not.
//
export default function useGraph(
  start: number,
  end: number,
): { graph: GraphState; dispatch: React.Dispatch<GraphAction> } {
  const [graph, dispatch] = useReducer(graphReducer, {
    alignment: 'fromStartTime',
    groupBy: 'step',
    sortBy: 'startTime',
    min: start,
    max: end,
    timelineStart: start,
    timelineEnd: end,
    controlled: false,
  });

  return { graph, dispatch };
}
