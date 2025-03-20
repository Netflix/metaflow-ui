import { Run } from '@/types';
import { getISOString } from './date';
import { formatDuration } from './format';

/**
 * Run id might be one of 3 fields. run, run_id, run_number. run should be field that has been combined from run_id and run_number but
 * let's have same fallbacks just in case.
 */
export function getRunId(run: Run): string {
  return run.run ?? run.run_id ?? (run.run_number ?? 0).toString();
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
export function getRunDuration(run: Run, format: 'default' | 'short' = 'default'): string | null {
  let duration: number | undefined = undefined;

  if (run.status === 'running') {
    duration = new Date().getTime() - run.ts_epoch;
  } else if (run.duration) {
    duration = run.duration;
  } else if (run.finished_at) {
    duration = run.finished_at - run.ts_epoch;
  }

  return duration ? formatDuration(duration, 0, format) : null;
}

/**
 * Safely get system tag with given prefix
 * @param run     - Run object
 * @param tagType - Prefix of tag we are trying to get
 */
export function getTagOfType(tags: string[], tagType: string): string | null {
  const tag = (tags || []).find((tag) => tag.startsWith(`${tagType}:`));
  return tag ? tag.split(`${tagType}:`)[1] : null;
}
