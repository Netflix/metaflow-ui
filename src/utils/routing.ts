import { match, matchPath } from 'react-router-dom';
import { Task } from '../types';

export const SHORT_PATHS = {
  runSubview: `/:flowId/:runNumber/view/:viewType`,
  task: `/:flowId/:runNumber/:stepName/:taskId`,
  step: '/:flowId/:runNumber/:stepName',
  run: '/:flowId/:runNumber',
  notifications: '/notifications',
  debug: '/debug',
  home: '/',
};

export type PathDefinition = typeof SHORT_PATHS;

type PathValue = string | number;

export const getPath = {
  step: (flowId: PathValue, runNumber: PathValue, stepName: PathValue): string =>
    `/${flowId}/${runNumber}/view/timeline?steps=${stepName}`,
  dag: (flowId: PathValue, runNumber: PathValue): string => `/${flowId}/${runNumber}/view/dag`,
  timeline: (flowId: PathValue, runNumber: PathValue): string => `/${flowId}/${runNumber}/view/timeline`,
  runSubView: (flowId: PathValue, runNumber: PathValue, view: string): string => `/${flowId}/${runNumber}/view/${view}`,
  tasks: (flowId: PathValue, runNumber: PathValue): string => `/${flowId}/${runNumber}/view/task`,
  task: (flowId: PathValue, runNumber: PathValue, stepName: PathValue, taskId: PathValue): string =>
    `/${flowId}/${runNumber}/${stepName}/${taskId}`,
  run: (flowId: PathValue, runNumber: PathValue): string => `/${flowId}/${runNumber}`,
  notifications: (): string => '/notifications',
  debug: (): string => '/debug',
  home: (): string => '/',
};

export const getPathFor = {
  task: (item: Task): string =>
    `/${item.flow_id}/${item.run_id || item.run_number}/${item.step_name}/${item.task_name || item.task_id}`,
  attempt: (item: Task): string =>
    `/${item.flow_id}/${item.run_id || item.run_number}/${item.step_name}/${item.task_name || item.task_id}?attempt=${
      item.attempt_id
    }`,
};

export type KnownURLParams = {
  flowId?: string;
  runNumber?: string;
  stepName?: string;
  taskId?: string;
};

/**
 * Returns parameters from given path (if matching to our defined routes)
 * @param pathname location.pathname
 */
export function getRouteMatch(pathname: string): match<KnownURLParams> | null {
  return matchPath<KnownURLParams>(
    pathname,
    Object.keys(SHORT_PATHS).map((key) => SHORT_PATHS[key as keyof PathDefinition]),
  );
}
