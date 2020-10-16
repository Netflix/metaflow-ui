/**
 * Converts milliseconds to duration string. We are never rounding anything up
 * @param time Time in milliseconds
 */
export function formatDuration(time: number, precision?: number): string {
  const secs = time / 1000;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;

  let str = '';

  if (hours > 0) str += hours + 'h ';
  if (minutes > 0) str += minutes + 'm ';
  if (seconds > 0 || str === '')
    str += (precision === 0 ? Math.floor(seconds) : secondsToPrecision(seconds, precision || 1)) + 's';

  return str;
}

function secondsToPrecision(time: number, precision: number) {
  const [seconds, decimals] = time.toString().split('.');

  return `${seconds}.${!decimals ? new Array(precision + 1).join('0') : decimals.substring(0, precision)}`;
}
