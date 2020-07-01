import { useReducer } from 'react';

export type GraphState = {
  // Relative or absolute rendering? Absolute = just line length
  mode: 'relative' | 'absolute';
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
  // Update active mode. TODO: Specify more what this feature does
  | { type: 'mode'; mode: 'relative' | 'absolute' }
  // Zoom functions manipulates timelineStart and timelineEnd values to kinda fake zooming.
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'resetZoom' }
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

    case 'mode':
      return { ...state, mode: action.mode };

    case 'zoomIn': {
      const tenthOfTimeline = (state.max - state.min) / 10;

      if (state.timelineEnd - tenthOfTimeline <= state.timelineStart + tenthOfTimeline) return state;

      return { ...updateGraph(state, tenthOfTimeline, -tenthOfTimeline), controlled: true };
    }

    case 'zoomOut': {
      const tenthOfTimeline = (state.max - state.min) / 10;

      if (zoomOverTotalLength(state, tenthOfTimeline)) {
        return resetTimeline(state);
      } else if (startOrEndOutOfBounds(state, -tenthOfTimeline, tenthOfTimeline)) {
        return {
          ...state,
          timelineStart: startOutOfBounds(state, -tenthOfTimeline)
            ? state.min
            : state.max - (state.timelineEnd - state.timelineStart + tenthOfTimeline),
          timelineEnd: endOutOfBounds(state, tenthOfTimeline)
            ? state.max
            : state.min + (state.timelineEnd - state.timelineStart + tenthOfTimeline),
        };
      } else {
        return updateGraph(state, -tenthOfTimeline, tenthOfTimeline);
      }
    }

    case 'resetZoom':
      return resetTimeline(state);

    case 'setControlled':
      return { ...state, controlled: action.value };
  }
  return state;
}

// When if tried zoom is bigger than total length of timeline (might happen on zoom out)
function zoomOverTotalLength(graph: GraphState, change: number) {
  return graph.timelineEnd + change - (graph.timelineStart - change) >= graph.max - graph.min;
}

// Check if scrollbar is going backwards too much
function startOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineStart + change < graph.min;
}

// Check if scrollbar is going forward too much
function endOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineEnd + change > graph.max;
}

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
export default function useGraph(start: number, end: number) {
  const [graph, dispatch] = useReducer(graphReducer, {
    mode: 'absolute',
    min: start,
    max: end,
    timelineStart: start,
    timelineEnd: end,
    controlled: false,
  });

  return { graph, dispatch };
}
