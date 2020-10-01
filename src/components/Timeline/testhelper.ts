import { GraphState } from './useGraph';
import { Task, Step } from '../../types';

//
// LOT OF TESTS DEPEND ON THESE VALUES AS DEFAULTS SO DONT CHANGE THESE!!!
//
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
    controlled: false,
    ...partialGraph,
  };
}

export function createTask(partialTask: Partial<Task>): Task {
  return {
    flow_id: 'BasicFlow',
    run_number: '1',
    step_name: 'askel',
    task_id: '1',
    user_name: 'SanteriCM',
    ts_epoch: 1595574762901,
    finished_at: 1595574762921,
    duration: 20,
    attempt_id: 0,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialTask,
  };
}

export function createStep(partialStep: Partial<Step>): Step {
  return {
    flow_id: 'BasicFlow',
    run_number: '1',
    step_name: 'askel',
    user_name: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialStep,
  };
}
