import { Run } from '../types';
import { getISOString } from './date';
import { formatDuration } from './format';

export function getRunId(run: Run): string {
  return run.run_id || (run.run_number || 0).toString();
}

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
  return run.duration
    ? formatDuration(run.duration, 0)
    : run.finished_at
    ? formatDuration(run.finished_at - run.ts_epoch, 0)
    : null;
}

/**
 * Safely get system tag with given prefix
 * @param run     - Run object
 * @param tagType - Prefix of tag we are trying to get
 */
export function getRunSystemTag(run: Run, tagType: string): string | null {
  const tag = (run.system_tags || []).find((tag) => tag.startsWith(`${tagType}:`));
  return tag ? tag.split(`${tagType}:`)[1] : null;
}
