/*
 * Draft of types from API. We must investigate if models can have some random stuff and figure out
 * how to type those things
 */

export interface MetaDataBaseObject {
  flow_id: string;
  user_name: string;
  ts_epoch: number;
  tags?: string[];
  system_tags: string[];
}

export type Flow = MetaDataBaseObject;

export type RunStatus = {
  completed: string;
  running: string;
  failed: string;
};

export interface Run extends MetaDataBaseObject {
  [index: string]: keyof MetaDataBaseObject | keyof RunStatus | string | number | string[] | undefined;
  run_number: string;
  status: keyof RunStatus;
  finished_at?: number;
  duration?: number;
}

export interface Step extends MetaDataBaseObject {
  run_number: string;
  step_name: string;
  finished_at?: number;
}

export interface Task extends MetaDataBaseObject {
  run_number: string;
  step_name: string;
  task_id: string;
  attempt_id: number;
  foreach_stack: ForeachStack | null;
  finished_at?: number;
  duration?: number;
  status: TaskStatus;
}

export type ForeachStack = Array<[string, string, number, number]>;

export type TaskStatus = 'running' | 'completed' | 'failed';

export interface Metadata extends MetaDataBaseObject {
  id: number;
  run_number: string;
  step_name: string;
  task_id: string;
  field_name: string;
  value: string;
  type: string;
}

export interface Artifact extends MetaDataBaseObject {
  run_number: number;
  step_name: string;
  task_id: number;
  name: string;
  location: string;
  ds_type: string;
  sha: string;
  type: string;
  content_type: string;
  attempt_id: number;
}

export interface RunParam {
  [key: string]: {
    value: string;
  };
}

export interface Log {
  row: number;
  line: string;
}

export type QueryParam = string | null;

export type AsyncStatus = 'NotAsked' | 'Ok' | 'Error' | 'Loading';

export type APIError = {
  id: string;
  traceback?: string;
  status: number;
  title: string;
  type: string;
  detail?: string;
};
