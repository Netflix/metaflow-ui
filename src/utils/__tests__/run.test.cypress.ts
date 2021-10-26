import { getRunDuration, getRunEndTime, getRunId, getRunStartTime, getTagOfType, getUsername } from '../run';
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
});
