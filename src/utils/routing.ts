const runPath = '/flows/:flowId/runs/:runNumber';

export const PATHS = {
  task: `${runPath}/steps/:stepName/tasks/:taskId`,
  runSubview: `${runPath}/view/:viewType`,
  run: runPath,
  home: '/',
};

export type PathDefinition = typeof PATHS;

type PathValue = string | number;

export const getPath = {
  step: (flowId: PathValue, runNumber: PathValue, stepName: PathValue): string =>
    `/flows/${flowId}/runs/${runNumber}/view/timeline?steps=${stepName}`,
  dag: (flowId: PathValue, runNumber: PathValue): string => `/flows/${flowId}/runs/${runNumber}/view/dag`,
  timeline: (flowId: PathValue, runNumber: PathValue): string => `/flows/${flowId}/runs/${runNumber}/view/timeline`,
  tasks: (flowId: PathValue, runNumber: PathValue): string => `/flows/${flowId}/runs/${runNumber}/view/task`,
  task: (flowId: PathValue, runNumber: PathValue, stepName: PathValue, taskId: PathValue): string =>
    `/flows/${flowId}/runs/${runNumber}/steps/${stepName}/tasks/${taskId}`,
  run: (flowId: PathValue, runNumber: PathValue): string => `/flows/${flowId}/runs/${runNumber}`,
  home: (): string => '/',
};
