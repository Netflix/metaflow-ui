/**
 * Converts milliseconds to duration string.
 * @param time Time in milliseconds
 */
export function formatDuration(time: number): string {
  const secs = time / 1000;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;

  let str = '';

  if (hours > 0) str += hours + 'h ';
  if (minutes > 0) str += minutes + 'm ';
  if (seconds > 0) str += seconds.toFixed(2) + 's';

  return str;
}
