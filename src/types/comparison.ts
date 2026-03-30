import { Run, RunParam, Step, Task, TaskStatus } from '@/types';

//
// Run Comparison Types
//
// All fields are sourced from existing API endpoints — no new backend routes required.
//
//   RunSnapshot.run         → GET /flows/{flow_id}/runs/{run_number}
//   RunSnapshot.parameters  → GET /flows/{flow_id}/runs/{run_number}/parameters
//   RunSnapshot.steps       → GET /flows/{flow_id}/runs/{run_number}/steps
//   StepSnapshot.tasks      → GET /flows/{flow_id}/runs/{run_number}/steps/{step_name}/tasks
//   StepSnapshot.artifacts  → GET /flows/{flow_id}/runs/{run_number}/steps/{step_name}/tasks/{task_id}/artifacts
//

/**
 * Snapshot of a single run with its parameters and step data.
 * Built by assembling responses from existing endpoints.
 */
export type RunSnapshot = {
  run: Run;
  parameters: RunParam;
  steps: StepSnapshot[];
};

/**
 * Snapshot of a single step within a run.
 * Status is derived from the step's tasks using getStepStatus (taskdataUtils.ts).
 */
export type StepSnapshot = {
  step: Step;
  status: TaskStatus;
  tasks: Task[];
  artifact_keys: string[];
};

/**
 * Top-level comparison container for two runs.
 */
export type RunComparisonData = {
  runA: RunSnapshot;
  runB: RunSnapshot;
};

//
// Derived diffs — computed client-side from RunComparisonData, never fetched.
//

export type RunDiff = {
  params: ParamDiff[];
  steps: StepDiff[];
  artifacts: ArtifactDiff[];
};

export type ParamDiff = {
  key: string;
  valueA: string | undefined;
  valueB: string | undefined;
  changed: boolean;
};

export type StepDiff = {
  step_name: string;
  durationA: number | null;
  durationB: number | null;
  delta_ms: number | null;
  statusA: TaskStatus;
  statusB: TaskStatus;
};

export type ArtifactDiff = {
  step_name: string;
  key: string;
  inA: boolean;
  inB: boolean;
};
