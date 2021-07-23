import { formatDuration } from '../format';

describe('Format utils', () => {
  it('formatDuration() - Seconds and precision', () => {
    expect(formatDuration(-1)).to.equal('0.0s');
    expect(formatDuration(-1, 0)).to.equal('0s');

    expect(formatDuration(0)).to.equal('0.0s');
    expect(formatDuration(0, 0)).to.equal('0s');
    expect(formatDuration(0, 2)).to.equal('0.00s');

    expect(formatDuration(150)).to.equal('0.1s');
    expect(formatDuration(199)).to.equal('0.1s');

    expect(formatDuration(151, 2)).to.equal('0.15s');
    expect(formatDuration(151, 0)).to.equal('0s');
  });

  it('formatDuration() - Minutes and hours', () => {
    expect(formatDuration(1000 * 60)).to.equal('1m ');
    expect(formatDuration(1000 * 75)).to.equal('1m 15s');

    expect(formatDuration(1000 * 60 * 60)).to.equal('1h ');
    expect(formatDuration(1000 * 60 * 75)).to.equal('1h 15m ');
    expect(formatDuration(1000 * 60 * 75 + 1500)).to.equal('1h 15m 1s');

    expect(formatDuration(1000 * 59 + 950)).to.equal('59.9s');
    expect(formatDuration(1000 * 59 + 950, 0)).to.equal('59s');
  });
});
