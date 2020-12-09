import { GraphState } from '../components/Timeline/useGraph';
import { createCache, Resource } from '../hooks/useResource';
import { Task, Step, Run, Metadata, APIError } from '../types';

//
// LOT OF TESTS DEPEND ON THESE VALUES AS DEFAULTS SO DONT CHANGE THESE!!!
//
export function createGraphState(partialGraph: Partial<GraphState>): GraphState {
  return {
    alignment: 'fromStartTime',
    sortBy: 'startTime',
    sortDir: 'asc',
    min: 0,
    max: 1000,
    timelineStart: 0,
    timelineEnd: 1000,
    controlled: false,
    stepFilter: [],
    statusFilter: null,
    group: true,
    isCustomEnabled: false,
    resetToFullview: false,
    ...partialGraph,
  };
}

export function createTask(partialTask: Partial<Task>): Task {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'askel',
    task_id: 1,
    status: 'completed',
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
    run_number: 1,
    step_name: 'askel',
    user_name: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialStep,
  };
}

export function createRun(partialRun: Partial<Run>): Run {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    user_name: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    status: 'completed',
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
    ...partialRun,
  };
}

export function createResource<T>(data: T, props: Partial<Resource<T>>): Resource<T> {
  return {
    url: '/example-route',
    data,
    error: null,
    getResult: () => undefined,
    cache: createCache(),
    target: '',
    status: 'Ok',
    ...props,
  };
}

export function createMetadata(data: Partial<Metadata>): Metadata {
  return {
    id: 0,
    run_number: 'string',
    step_name: 'string',
    task_id: 'string',
    field_name: 'string',
    value: 'string',
    type: 'string',
    flow_id: 'string',
    user_name: 'string',
    ts_epoch: 0,
    system_tags: [],
    ...data,
  };
}

export function createAPIError(err: Partial<APIError>): APIError {
  return {
    id: 'err0r-id-12345',
    traceback: 'badcode.js line 12\nevenworsecode.js line 524\nworstcode.js line 123917',
    status: 500,
    title: 'Very bad code',
    type: 'Error',
    detail: 'undefined is not a function',
    ...err,
  };
}
