import { GraphState } from '../components/Timeline/useGraph';
import { RowDataModel, StepRowData } from '../components/Timeline/useTaskData';
import { Row } from '../components/Timeline/VirtualizedTimeline';
import { Resource } from '../hooks/useResource';
import { Task, Step, Run, Metadata, APIError, TaskStatus } from '../types';

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
    step_name: 'start',
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
    step_name: 'start',
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
    user: 'SanteriCM',
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
    getResult: () => null,
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

export function createTaskRow(tasks: Task[] | undefined): Row {
  return { type: 'task', data: tasks || [createTask({})] };
}

export function createStepRow(step: Partial<Step>, stepRowObject: Partial<StepRowData>): Row {
  return {
    type: 'step',
    data: { ...createStep({}), ...step },
    rowObject: {
      isOpen: true,
      finished_at: 1000,
      duration: 1000,
      status: 'completed',
      step: { ...createStep({}), ...step },
      data: {},
      ...stepRowObject,
    },
  };
}

export function createStepRowData(
  rowdata: Partial<StepRowData>,
  step: Partial<Step>,
  tasks: Record<string, Task[]>,
): StepRowData {
  return {
    step: createStep(step),
    isOpen: true,
    status: 'completed' as TaskStatus,
    finished_at: 0,
    duration: 0,
    data: { '1': [createTask({})], ...tasks },
    ...rowdata,
  };
}

export function createRowDataModel(data: Record<string, StepRowData>): RowDataModel {
  return { start: createStepRowData({}, {}, {}), ...data };
}
