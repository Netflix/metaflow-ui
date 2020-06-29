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
};

export type GraphAction =
  | { type: 'init'; start: number; end: number }
  | { type: 'move'; value: number }
  | { type: 'updateMax'; end: number }
  | { type: 'mode'; mode: 'relative' | 'absolute' }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'resetZoom' };

function graphReducer(state: GraphState, action: GraphAction) {
  switch (action.type) {
    case 'init':
      return { ...state, max: action.end, min: action.start, timelineEnd: action.end, timelineStart: action.start };

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
      return { ...state, max: action.end, timelineEnd: action.end };

    case 'mode':
      return { ...state, mode: action.mode };

    case 'zoomIn': {
      const tenthOfTimeline = (state.max - state.min) / 10;

      if (state.timelineEnd - tenthOfTimeline <= state.timelineStart + tenthOfTimeline) return state;

      return updateGraph(state, tenthOfTimeline, -tenthOfTimeline);
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
  }
  return state;
}

function zoomOverTotalLength(graph: GraphState, change: number) {
  return graph.timelineEnd + change - graph.timelineStart - change > graph.max - graph.min;
}

function startOutOfBounds(graph: GraphState, change: number) {
  return graph.timelineStart + change < graph.min;
}

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
  };
}

export default function useGraph() {
  const [graph, dispatch] = useReducer(graphReducer, {
    mode: 'absolute',
    min: 0,
    max: 10,
    timelineStart: 0,
    timelineEnd: 0,
  });

  return { graph, dispatch };
}
