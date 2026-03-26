import {
  getRunDuration,
  getRunDisplayStatus,
  getRunEndTime,
  getRunId,
  getRunStartTime,
  getTagOfType,
  getUsername,
  isRunStale,
} from '../run';
import { createRun } from '../testhelper';

describe('run.ts tests', () => {
  it('getRunId', () => {
    expect(getRunId(createRun({ run_id: 'hello', run_number: 123 }))).to.equal('hello');
    expect(getRunId(createRun({ run_number: 123 }))).to.equal('123');
  });

  it('getUsername', () => {
    expect(getUsername(createRun({ system_tags: [] }))).to.equal('');
    expect(getUsername(createRun({ system_tags: ['user:santeri'] }))).to.equal('santeri');
  });

  it('getRunStartTime', () => {
    expect(getRunStartTime(createRun({ ts_epoch: 1000 }))).to.equal('01-01-1970 00:00:01');
    expect(getRunStartTime(createRun({ ts_epoch: 1000 }), '+02:00')).to.equal('01-01-1970 02:00:01');
    expect(getRunStartTime(createRun({ ts_epoch: 1000 }), '-02:00')).to.equal('12-31-1969 22:00:01');
  });

  it('getRunEndTime', () => {
    expect(getRunEndTime(createRun({}))).to.equal(null);
    expect(getRunEndTime(createRun({ finished_at: 1000 }))).to.equal('01-01-1970 00:00:01');
    expect(getRunEndTime(createRun({ finished_at: 1000 }), '+02:00')).to.equal('01-01-1970 02:00:01');
    expect(getRunEndTime(createRun({ finished_at: 1000 }), '-02:00')).to.equal('12-31-1969 22:00:01');
  });

  it('getRunDuration', () => {
    expect(getRunDuration(createRun({}))).to.equal(null);
    expect(getRunDuration(createRun({ duration: 1000 }))).to.equal('1s');
    expect(getRunDuration(createRun({ ts_epoch: 0, finished_at: 1000, duration: undefined }))).to.equal('1s');
  });

  it('getTagOfType', () => {
    expect(getTagOfType([], 'user')).to.equal(null);
    const tags = ['user:santeri', 'project:metaflow', 'year:2021', 'test:'];
    expect(getTagOfType(tags, 'user')).to.equal('santeri');
    expect(getTagOfType(tags, 'project')).to.equal('metaflow');
    expect(getTagOfType(tags, 'year')).to.equal('2021');
    expect(getTagOfType(tags, 'test')).to.equal('');
  });

  describe('isRunStale', () => {
    it('returns false for completed runs', () => {
      expect(isRunStale(createRun({ status: 'completed' }))).to.equal(false);
    });

    it('returns false for failed runs', () => {
      expect(isRunStale(createRun({ status: 'failed' }))).to.equal(false);
    });

    it('returns false for running runs without heartbeat data', () => {
      expect(isRunStale(createRun({ status: 'running' }))).to.equal(false);
    });

    it('returns false for running runs with recent heartbeat', () => {
      const recentHeartbeat = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
      expect(
        isRunStale(createRun({ status: 'running', last_heartbeat_ts: recentHeartbeat })),
      ).to.equal(false);
    });

    it('returns true for running runs with expired heartbeat', () => {
      const oldHeartbeat = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      expect(
        isRunStale(createRun({ status: 'running', last_heartbeat_ts: oldHeartbeat })),
      ).to.equal(true);
    });
  });

  describe('getRunDisplayStatus', () => {
    it('returns original status for non-stale runs', () => {
      expect(getRunDisplayStatus(createRun({ status: 'completed' }))).to.equal('completed');
      expect(getRunDisplayStatus(createRun({ status: 'running' }))).to.equal('running');
      expect(getRunDisplayStatus(createRun({ status: 'failed' }))).to.equal('failed');
    });

    it('returns failed for stale running runs', () => {
      const oldHeartbeat = Math.floor(Date.now() / 1000) - 600;
      expect(
        getRunDisplayStatus(createRun({ status: 'running', last_heartbeat_ts: oldHeartbeat })),
      ).to.equal('failed');
    });
  });
});
