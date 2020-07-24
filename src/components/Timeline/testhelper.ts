import { GraphState } from './useGraph';

export function createGraphState(partialGraph: Partial<GraphState>): GraphState {
  return {
    alignment: 'fromStartTime',
    groupBy: 'step',
    sortBy: 'startTime',
    sortDir: 'asc',
    min: 0,
    max: 1000,
    timelineStart: 0,
    timelineEnd: 1000,
    controlled: true,
    ...partialGraph,
  };
}
