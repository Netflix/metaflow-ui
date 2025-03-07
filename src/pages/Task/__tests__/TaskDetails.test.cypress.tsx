import { createTask } from '@utils/testhelper';
import { getAttemptDuration } from '@pages/Task/components/TaskDetails';

describe('TaskDetails component', () => {
  it('Util - getAttemptDuration', () => {
    // No attempts, no duration -> return empty string
    expect(getAttemptDuration(createTask({ duration: undefined }))).to.equal('');
    // No attempts, task with duration -> return own duration
    expect(getAttemptDuration(createTask({ duration: 500 }))).to.equal('0.5s');

    // If attempt has no started_at, has duration BUT earlier attempt doesn't have duration -> return own duration
    const tarray = [createTask({ attempt_id: 0, duration: undefined }), createTask({ attempt_id: 1, duration: 500 })];
    expect(getAttemptDuration(tarray[1])).to.equal('0.5s');

    // If attempt has started_at we can trust its duration -> return own duration
    const tarray3 = [
      createTask({ attempt_id: 0, duration: 300 }),
      createTask({ attempt_id: 1, started_at: 10, duration: 500 }),
    ];
    expect(getAttemptDuration(tarray3[1])).to.equal('0.5s');
  });
});
