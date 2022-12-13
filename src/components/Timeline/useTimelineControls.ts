import { useEffect, useReducer } from 'react';
import { Run } from '../../types';
import { getLongestRowDuration, startAndEndpointsOfRows } from '../../utils/row';
import { Row } from './VirtualizedTimeline';

//
// Hook for controlling timeline. Timeline does not require use of this but this hook will provide functions
// for zooming and moving around.
//

export type TimelineControlsState = {
  // Minimum timestamp in timeline. This is starting point
  min: number;
  // Maximum timestamp of timeline. This is ending point
  max: number;
  // Selected starting point. This is start of the visible section.
  timelineStart: number;
  // Selected ending point. This is end of the visible section.
  timelineEnd: number;
  // If user has zoomed in, we don't want to update zoom status when new updates come in.
  controlled: boolean;
};

export type TimelineAction =
  // Set min and max values for timeline and set zoom to full
  | { type: 'update'; start: number; end: number; mode: 'left' | 'startTime' }
  // Move timeline to backwards or forward. (minus value to move backwards)
  | { type: 'move'; value: number }
  // Zoom functions manipulates timelineStart and timelineEnd values to kinda fake zooming.
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'setZoom'; start: number; end: number }
  | { type: 'resetZoom' }
  | { type: 'reset' }
  // Update zoom contol state. If controlled, we dont update zoom level.
  | { type: 'setControlled'; value: boolean }
  | { type: 'incrementTimelineLength' };

export function timelineControlsReducer(state: TimelineControlsState, action: TimelineAction): TimelineControlsState {
  switch (action.type) {
    case 'update': {
      const end = state.max > action.end ? state.max : action.end;
      if (state.controlled) {
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
          max: action.mode === 'left' ? action.end : end,
          min: action.start,
          timelineEnd: action.mode === 'left' ? action.end : end,
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
export function getZoomAmount(state: TimelineControlsState): number {
  const currentVisiblePortion = (state.timelineEnd - state.timelineStart) / (state.max - state.min);
  return currentVisiblePortion < 0.21 ? (state.max - state.min) / 50 : (state.max - state.min) / 10;
}

/**
 * When if tried zoom is bigger than total length of timeline (might happen on zoom out)
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function zoomOverTotalLength(graph: TimelineControlsState, change: number): boolean {
  return graph.timelineEnd + change - (graph.timelineStart - change) >= graph.max - graph.min;
}

/**
 * Check if scrollbar is going backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function startOutOfBounds(graph: TimelineControlsState, change: number): boolean {
  return graph.timelineStart + change < graph.min;
}

/**
 * Check if scrollbar is going forward too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 */
export function endOutOfBounds(graph: TimelineControlsState, change: number): boolean {
  return graph.timelineEnd + change > graph.max;
}

/**
 * Check if scrollbar is going forward and backwards too much
 * @param graph State of current graph
 * @param change Amount we are about to change visible value
 * @param changeEnd We might want to move and value different direction than start (zoom events)
 */
export function startOrEndOutOfBounds(graph: TimelineControlsState, change: number, changeEnd?: number): boolean {
  return startOutOfBounds(graph, change) || endOutOfBounds(graph, changeEnd || change);
}

export function updateGraph(graph: TimelineControlsState, change: number, changeEnd?: number): TimelineControlsState {
  return {
    ...graph,
    timelineStart: graph.timelineStart + change,
    timelineEnd: graph.timelineEnd + (changeEnd || change),
  };
}

export function resetTimeline(graph: TimelineControlsState): TimelineControlsState {
  return {
    ...graph,
    timelineStart: graph.min,
    timelineEnd: graph.max,
    controlled: false,
  };
}

export type TimelineControlsHook = {
  timelineControls: TimelineControlsState;
  dispatch: React.Dispatch<TimelineAction>;
};

export default function useTimelineControls(
  run: Run,
  rows: Row[],
  mode: 'left' | 'startTime' = 'startTime',
): TimelineControlsHook {
  const [timelineControls, dispatch] = useReducer(timelineControlsReducer, {
    min: run.ts_epoch,
    max: run.finished_at || run.ts_epoch,
    timelineStart: run.ts_epoch,
    timelineEnd: run.finished_at || run.ts_epoch,
    controlled: false,
  });

  useEffect(() => {
    const timings = startAndEndpointsOfRows([...rows]);
    const endTime =
      mode === 'left'
        ? run.ts_epoch + getLongestRowDuration(rows)
        : run.finished_at && run.finished_at > timings.end
        ? run.finished_at
        : timings.end;
    if (timings.start !== 0 && endTime !== 0 && endTime !== timelineControls.max) {
      dispatch({
        type: 'update',
        start: run.ts_epoch,
        end: endTime,
        mode: mode,
      });
    }
  }, [rows, run.ts_epoch, mode, run.finished_at, timelineControls.max]);

  useEffect(() => {
    const tm = setInterval(() => {
      if (run.status === 'running' && mode !== 'left') {
        dispatch({ type: 'incrementTimelineLength' });
      }
    }, 1000);

    return () => clearInterval(tm);
  }, [run.status, mode]);

  return { timelineControls, dispatch };
}
