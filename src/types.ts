import { NotificationType } from './components/Notifications';

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
  run_number: number;
  run?: string;
  status: keyof RunStatus;
  user: string | null;
  finished_at?: number;
  run_id?: string;
  duration?: number;
}

export interface Step extends MetaDataBaseObject {
  run_number: number;
  run_id?: string;
  step_name: string;
  finished_at?: number;
  duration?: number;
}

export interface Task extends MetaDataBaseObject {
  run_number: number;
  run_id?: string;
  step_name: string;
  task_id: number;
  task_name?: string;
  attempt_id: number;
  started_at?: number;
  foreach_label?: string;
  finished_at?: number;
  duration?: number;
  status: TaskStatus;
}

export type TaskStatus = 'running' | 'completed' | 'failed' | 'unknown' | 'pending';

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

export interface Announcement {
  contentType: 'text' | 'markdown';
  created?: number;
  end: number;
  id: string;
  message: string;
  start: number;
  type: NotificationType;
  url?: string;
  urlText?: string;
}

export interface AnnouncementHeader {
  id: string;
  message: string;
  type: string;
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
