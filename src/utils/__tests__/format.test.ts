import { formatDuration } from '../format';

describe('Format utils', () => {
  test('formatDuration() - Seconds and precision', () => {
    expect(formatDuration(0)).toBe('0.0s');
    expect(formatDuration(0, 0)).toBe('0s');
    expect(formatDuration(0, 2)).toBe('0.00s');

    expect(formatDuration(150)).toBe('0.1s');
    expect(formatDuration(199)).toBe('0.1s');

    expect(formatDuration(151, 2)).toBe('0.15s');
    expect(formatDuration(151, 0)).toBe('0s');
  });

  test('formatDuration() - Minutes and hours', () => {
    expect(formatDuration(1000 * 60)).toBe('1m ');
    expect(formatDuration(1000 * 75)).toBe('1m 15.0s');

    expect(formatDuration(1000 * 60 * 60)).toBe('1h ');
    expect(formatDuration(1000 * 60 * 75)).toBe('1h 15m ');
    expect(formatDuration(1000 * 60 * 75 + 1500)).toBe('1h 15m 1.5s');

    expect(formatDuration(1000 * 59 + 950)).toBe('59.9s');
    expect(formatDuration(1000 * 59 + 950, 0)).toBe('59s');
  });
});
