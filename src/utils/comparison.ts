import { RunParam } from '@/types';
import {
  ArtifactDiff,
  ParamDiff,
  RunComparisonData,
  RunDiff,
  StepDiff,
} from '@/types/comparison';

/**
 * Compute the full diff between two run snapshots.
 * All diffing is client-side — no additional API calls needed.
 */
export function computeRunDiff(data: RunComparisonData): RunDiff {
  return {
    params: computeParamDiffs(data.runA.parameters, data.runB.parameters),
    steps: computeStepDiffs(data),
    artifacts: computeArtifactDiffs(data),
  };
}

/**
 * Compare parameters between two runs.
 * Keys present in either run are included; changed flag indicates a value difference.
 */
export function computeParamDiffs(paramsA: RunParam, paramsB: RunParam): ParamDiff[] {
  const allKeys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]);
  const diffs: ParamDiff[] = [];

  for (const key of allKeys) {
    const valueA = paramsA[key]?.value;
    const valueB = paramsB[key]?.value;
    diffs.push({
      key,
      valueA,
      valueB,
      changed: valueA !== valueB,
    });
  }

  return diffs.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Compare steps between two runs by step_name.
 * Steps present in only one run get null values for the missing side.
 */
export function computeStepDiffs(data: RunComparisonData): StepDiff[] {
  const stepsA = new Map(data.runA.steps.map((s) => [s.step.step_name, s]));
  const stepsB = new Map(data.runB.steps.map((s) => [s.step.step_name, s]));
  const allStepNames = new Set([...stepsA.keys(), ...stepsB.keys()]);
  const diffs: StepDiff[] = [];

  for (const step_name of allStepNames) {
    const a = stepsA.get(step_name);
    const b = stepsB.get(step_name);
    const durationA = a?.step.duration ?? null;
    const durationB = b?.step.duration ?? null;

    diffs.push({
      step_name,
      durationA,
      durationB,
      delta_ms: durationA !== null && durationB !== null ? durationB - durationA : null,
      statusA: a?.status ?? 'unknown',
      statusB: b?.status ?? 'unknown',
    });
  }

  return diffs;
}

/**
 * Compare artifact presence between two runs at the step level.
 * Does not compare artifact values — only whether a given artifact key exists in each run.
 */
export function computeArtifactDiffs(data: RunComparisonData): ArtifactDiff[] {
  const diffs: ArtifactDiff[] = [];

  // Build a map of step_name -> Set<artifact_key> for each run
  const artifactsA = new Map<string, Set<string>>();
  for (const step of data.runA.steps) {
    artifactsA.set(step.step.step_name, new Set(step.artifact_keys));
  }

  const artifactsB = new Map<string, Set<string>>();
  for (const step of data.runB.steps) {
    artifactsB.set(step.step.step_name, new Set(step.artifact_keys));
  }

  const allStepNames = new Set([...artifactsA.keys(), ...artifactsB.keys()]);

  for (const step_name of allStepNames) {
    const keysA = artifactsA.get(step_name) ?? new Set();
    const keysB = artifactsB.get(step_name) ?? new Set();
    const allKeys = new Set([...keysA, ...keysB]);

    for (const key of allKeys) {
      diffs.push({
        step_name,
        key,
        inA: keysA.has(key),
        inB: keysB.has(key),
      });
    }
  }

  return diffs;
}
