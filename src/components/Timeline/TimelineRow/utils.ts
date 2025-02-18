import { Step, Task, TaskStatus } from '../../../types';
import { StepRowData } from '../useTaskData';
import { LabelPosition } from './LineElement';
import { brightenCssVar } from '../../../utils/style';

/**
 * Finds place for duration label in timeline. Default right, if not space left, if no space then none.
 * @param fromLeft % value from left of timeline
 * @param width Width of given element
 * @returns Position where label should be positioned
 */
export function getLengthLabelPosition(fromLeft: number, width: number): LabelPosition {
  if (fromLeft + width < 90) {
    return 'right';
  } else if (fromLeft + width > 90 && fromLeft > 10) {
    return 'left';
  }

  return 'none';
}

export function getStepDuration(step: Step, status: string, calculatedDuration: number): number {
  if (status === 'running') {
    return Date.now() - step.ts_epoch;
  }

  return step.duration && step.duration > calculatedDuration ? step.duration : calculatedDuration;
}

export function getRowStatus(
  row: { type: 'step'; data: Step; rowObject: StepRowData } | { type: 'task'; data: Task },
): TaskStatus {
  if (row.type === 'step') {
    return row.rowObject.status;
  } else {
    if (row.data.status) {
      return row.data.status;
    } else {
      return row.data.finished_at ? 'completed' : 'running';
    }
  }
}

export function lineColor(grayed: boolean, state: string, isFirst: boolean): string {
  if (grayed) {
    return 'var(--timeline-line-color-neutral)';
  } else {
    switch (state) {
      case 'completed':
      case 'ok':
        return !isFirst ? brightenCssVar('--timeline-line-color-danger', 30) : 'var(--timeline-line-color-success)';
      case 'running':
        return 'var(--timeline-line-color-running)';
      case 'pending':
        return 'var(--timeline-line-color-warning)';
      case 'failed':
        return !isFirst ? brightenCssVar('--timeline-line-color-danger', 30) : 'var(--timeline-line-color-danger)';
      case 'unknown':
        return !isFirst ? brightenCssVar('--timeline-line-color-unknown', 30) : 'var(--timeline-line-color-unknown)';
      default:
        return brightenCssVar('--timeline-line-color-unknown', 50);
    }
  }
}
