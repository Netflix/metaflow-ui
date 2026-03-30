import { computeParamDiffs, computeStepDiffs, computeArtifactDiffs, computeRunDiff } from '../comparison';
import { createRun, createStep, createTask } from '../testhelper';
import { RunComparisonData } from '@/types/comparison';
import { RunParam } from '@/types';

//
// Test helpers
//

function makeSnapshot(
  runOverrides: Parameters<typeof createRun>[0],
  params: RunParam,
  steps: { stepName: string; status: string; duration?: number; artifacts?: string[] }[],
) {
  return {
    run: createRun(runOverrides),
    parameters: params,
    steps: steps.map((s) => ({
      step: createStep({ step_name: s.stepName, duration: s.duration }),
      status: s.status as any,
      tasks: [createTask({ step_name: s.stepName, status: s.status as any })],
      artifact_keys: s.artifacts ?? [],
    })),
  };
}

//
// Tests
//

describe('comparison.ts — computeParamDiffs', () => {
  it('identical params produce no changes', () => {
    const params: RunParam = { alpha: { value: '0.01' }, epochs: { value: '10' } };
    const diffs = computeParamDiffs(params, params);

    expect(diffs.length).to.equal(2);
    diffs.forEach((d) => expect(d.changed).to.equal(false));
  });

  it('detects changed values', () => {
    const a: RunParam = { alpha: { value: '0.01' } };
    const b: RunParam = { alpha: { value: '0.001' } };
    const diffs = computeParamDiffs(a, b);

    expect(diffs.length).to.equal(1);
    expect(diffs[0].changed).to.equal(true);
    expect(diffs[0].valueA).to.equal('0.01');
    expect(diffs[0].valueB).to.equal('0.001');
  });

  it('handles params present in only one run', () => {
    const a: RunParam = { alpha: { value: '0.01' } };
    const b: RunParam = { beta: { value: '0.9' } };
    const diffs = computeParamDiffs(a, b);

    expect(diffs.length).to.equal(2);
    const alpha = diffs.find((d) => d.key === 'alpha')!;
    const beta = diffs.find((d) => d.key === 'beta')!;

    expect(alpha.valueA).to.equal('0.01');
    expect(alpha.valueB).to.equal(undefined);
    expect(alpha.changed).to.equal(true);
    expect(beta.valueA).to.equal(undefined);
    expect(beta.valueB).to.equal('0.9');
    expect(beta.changed).to.equal(true);
  });

  it('empty params produce empty diffs', () => {
    expect(computeParamDiffs({}, {}).length).to.equal(0);
  });
});

describe('comparison.ts — computeStepDiffs', () => {
  it('computes duration delta between matching steps', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'train', status: 'completed', duration: 5000 }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'train', status: 'completed', duration: 3000 }]),
    };
    const diffs = computeStepDiffs(data);

    expect(diffs.length).to.equal(1);
    expect(diffs[0].step_name).to.equal('train');
    expect(diffs[0].delta_ms).to.equal(-2000); // run B was 2s faster
  });

  it('handles steps present in only one run', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'start', status: 'completed' }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'end', status: 'completed' }]),
    };
    const diffs = computeStepDiffs(data);

    expect(diffs.length).to.equal(2);
    const startDiff = diffs.find((d) => d.step_name === 'start')!;
    expect(startDiff.statusA).to.equal('completed');
    expect(startDiff.statusB).to.equal('unknown');
  });

  it('null delta when either duration is missing', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'train', status: 'running' }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'train', status: 'completed', duration: 3000 }]),
    };
    const diffs = computeStepDiffs(data);

    expect(diffs[0].delta_ms).to.equal(null);
  });

  it('returns steps sorted alphabetically by step_name', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [
        { stepName: 'train', status: 'completed', duration: 1000 },
        { stepName: 'end', status: 'completed', duration: 500 },
        { stepName: 'start', status: 'completed', duration: 200 },
      ]),
      runB: makeSnapshot({ run_number: 2 }, {}, [
        { stepName: 'train', status: 'completed', duration: 2000 },
        { stepName: 'end', status: 'completed', duration: 600 },
        { stepName: 'start', status: 'completed', duration: 300 },
      ]),
    };
    const diffs = computeStepDiffs(data);

    expect(diffs.length).to.equal(3);
    expect(diffs[0].step_name).to.equal('end');
    expect(diffs[1].step_name).to.equal('start');
    expect(diffs[2].step_name).to.equal('train');
  });
});

describe('comparison.ts — computeArtifactDiffs', () => {
  it('detects artifacts present in both runs', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'train', status: 'completed', artifacts: ['model', 'loss'] }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'train', status: 'completed', artifacts: ['model', 'loss'] }]),
    };
    const diffs = computeArtifactDiffs(data);

    expect(diffs.length).to.equal(2);
    diffs.forEach((d) => {
      expect(d.inA).to.equal(true);
      expect(d.inB).to.equal(true);
    });
  });

  it('detects artifacts present in only one run', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'train', status: 'completed', artifacts: ['model'] }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'train', status: 'completed', artifacts: ['model', 'metrics'] }]),
    };
    const diffs = computeArtifactDiffs(data);
    const metricsDiff = diffs.find((d) => d.key === 'metrics')!;

    expect(metricsDiff.inA).to.equal(false);
    expect(metricsDiff.inB).to.equal(true);
  });

  it('handles empty artifact lists', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot({ run_number: 1 }, {}, [{ stepName: 'start', status: 'completed', artifacts: [] }]),
      runB: makeSnapshot({ run_number: 2 }, {}, [{ stepName: 'start', status: 'completed', artifacts: [] }]),
    };
    const diffs = computeArtifactDiffs(data);

    expect(diffs.length).to.equal(0);
  });
});

describe('comparison.ts — computeRunDiff', () => {
  it('produces a complete diff from two run snapshots', () => {
    const data: RunComparisonData = {
      runA: makeSnapshot(
        { run_number: 1 },
        { lr: { value: '0.01' } },
        [{ stepName: 'train', status: 'completed', duration: 5000, artifacts: ['model'] }],
      ),
      runB: makeSnapshot(
        { run_number: 2 },
        { lr: { value: '0.001' } },
        [{ stepName: 'train', status: 'completed', duration: 3000, artifacts: ['model', 'metrics'] }],
      ),
    };
    const diff = computeRunDiff(data);

    expect(diff.params.length).to.equal(1);
    expect(diff.params[0].changed).to.equal(true);
    expect(diff.steps.length).to.equal(1);
    expect(diff.steps[0].delta_ms).to.equal(-2000);
    expect(diff.artifacts.length).to.equal(2);
  });
});
