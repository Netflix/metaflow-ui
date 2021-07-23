import { getLongestRowDuration, getTaskLineStatus, startAndEndpointsOfRows } from '../row';
import { createStepRow, createTask, createTaskRow } from '../testhelper';

describe('row.ts tests', () => {
  it('startAndEndpointsOfRows', () => {
    const rows = [
      createTaskRow([createTask({ ts_epoch: 10, finished_at: 50 }), createTask({ ts_epoch: 60, finished_at: 150 })]),
      createTaskRow([createTask({ ts_epoch: 10, finished_at: 50 }), createTask({ ts_epoch: 60, finished_at: 180 })]),
    ];
    expect(startAndEndpointsOfRows(rows)).to.eql({ start: 0, end: 180 });
    const rows2 = [
      createTaskRow([
        createTask({ started_at: 10, finished_at: 50 }),
        createTask({ started_at: 60, finished_at: 150 }),
      ]),
      createTaskRow([
        createTask({ started_at: 10, finished_at: 50 }),
        createTask({ started_at: 60, finished_at: 180 }),
      ]),
    ];
    expect(startAndEndpointsOfRows(rows2)).to.eql({ start: 10, end: 180 });
  });

  it('getLongestRowDuration', () => {
    const rows = [createTaskRow([createTask({ duration: 90 })]), createTaskRow([createTask({ duration: 40 })])];
    expect(getLongestRowDuration(rows)).to.equal(90);
    const rowsWithSteps = [createTaskRow([createTask({ duration: 90 })]), createStepRow({}, { duration: 200 })];
    expect(getLongestRowDuration(rowsWithSteps)).to.equal(200);
  });

  it('getTaskLineStatus', () => {
    // Failed since there is one failed status
    expect(
      getTaskLineStatus([
        createTaskRow([createTask({ status: 'completed' })]),
        createTaskRow([createTask({ status: 'failed' })]),
      ]),
    ).to.equal('failed');
    // Running since there is one running status
    expect(
      getTaskLineStatus([
        createTaskRow([createTask({ status: 'running' })]),
        createTaskRow([createTask({ status: 'completed' })]),
      ]),
    ).to.equal('running');
    // Unkown since there is one unkown
    expect(
      getTaskLineStatus([
        createTaskRow([createTask({ status: 'unknown' })]),
        createTaskRow([createTask({ status: 'completed' })]),
      ]),
    ).to.equal('unknown');

    expect(getTaskLineStatus([createTaskRow([createTask({ status: 'completed' })])])).to.equal('completed');
  });
});
