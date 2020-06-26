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

export interface Flow extends MetaDataBaseObject {}

export interface Run extends MetaDataBaseObject {
  run_number: number;
}

export interface Step extends MetaDataBaseObject {
  run_number: number;
  step_name: string;
}

export interface Task extends MetaDataBaseObject {
  run_number: number;
  step_name: string;
  task_id: number;
  finished_at: number;
}

export interface Metadata extends MetaDataBaseObject {
  id: number;
  run_number: number;
  step_name: string;
  task_id: number;
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
