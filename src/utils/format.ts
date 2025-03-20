/**
 * Converts milliseconds to duration string. We are never rounding anything up
 * @param time Time in milliseconds
 */
export function formatDuration(
  time: number | null,
  precision?: number,
  format: 'short' | 'default' = 'default',
): string {
  if (time === null) {
    return '';
  }
  if (time < 0) {
    return precision === 0 ? '0s' : '0.0s';
  }
  const secs = time / 1000;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;

  let str = '';

  if (hours > 0) str += hours + 'h ';
  if (minutes > 0) str += minutes + 'm ';
  const shouldIncludeSeconds = format === 'default' || (format === 'short' && hours === 0);
  if (shouldIncludeSeconds && (seconds > 0 || str === ''))
    str += (precision === 0 || secs > 60 ? Math.floor(seconds) : secondsToPrecision(seconds, precision || 1)) + 's';

  return str;
}

function secondsToPrecision(time: number, precision: number) {
  const [seconds, decimals] = time.toString().split('.');

  return `${seconds}.${!decimals ? new Array(precision + 1).join('0') : decimals.substring(0, precision)}`;
}
