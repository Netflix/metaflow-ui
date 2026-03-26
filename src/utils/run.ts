import { Run } from '@/types';
import { getISOString } from './date';
import { formatDuration } from './format';

// If a run has been "running" with no heartbeat for longer than this,
// consider it stale (likely crashed). Default: 5 minutes in seconds.
const RUN_HEARTBEAT_TIMEOUT_SECONDS = 5 * 60;

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
export function getRunDuration(run: Run): string | null {
  if (run.status === 'running') {
    // Stop counting duration for stale runs -- freeze at last heartbeat
    if (isRunStale(run) && run.last_heartbeat_ts) {
      return formatDuration(run.last_heartbeat_ts * 1000 - run.ts_epoch, 0);
    }
    return formatDuration(new Date().getTime() - run.ts_epoch, 0);
  }

  return run.duration
    ? formatDuration(run.duration, 0)
    : run.finished_at
      ? formatDuration(run.finished_at - run.ts_epoch, 0)
      : null;
}

/**
 * Check if a run is stale: status is "running" but heartbeat has expired.
 * This catches crashed flows that the backend hasn't updated yet.
 * @param run - Run object
 */
export function isRunStale(run: Run): boolean {
  if (run.status !== 'running') {
    return false;
  }

  // If we have a heartbeat timestamp, check if it's expired
  if (run.last_heartbeat_ts) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds - run.last_heartbeat_ts > RUN_HEARTBEAT_TIMEOUT_SECONDS;
  }

  // No heartbeat data available, can't determine staleness
  return false;
}

/**
 * Get the display status for a run, accounting for staleness.
 * Returns the original status unless the run is stale, in which case
 * it returns 'failed' so the UI shows the correct visual state.
 */
export function getRunDisplayStatus(run: Run): 'completed' | 'running' | 'failed' {
  if (isRunStale(run)) {
    return 'failed';
  }
  return run.status;
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
