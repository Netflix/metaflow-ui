import { Run } from '../types';
import { getISOString } from './date';
import { formatDuration } from './format';

/**
 * Safely get username of run
 * @param run - Run object
 */
export function getUsername(run: Run): string {
  const tag = (run.system_tags || []).find((t) => t.startsWith('user:'));

  if (!tag) return '';

  return tag.split(':')[1];
}

/**
 * Safely get start time of run
 * @param run - Run object
 */
export function getRunStartTime(run: Run, timezone?: string): string {
  return getISOString(new Date(run.ts_epoch), timezone);
}

/**
 * Safely get end time of run
 * @param run - Run object
 */
export function getRunEndTime(run: Run, timezone?: string): string | null {
  return !!run.finished_at ? getISOString(new Date(run.finished_at), timezone) : null;
}

/**
 * Safely get duration of run
 * @param run - Run object
 */
export function getRunDuration(run: Run): string | null {
  return run.duration ? formatDuration(run.duration, 0) : null;
}
