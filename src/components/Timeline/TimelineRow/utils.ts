import { lighten } from 'polished';
import { DefaultTheme } from 'styled-components';
import { Step, Task } from '../../../types';
import { StepRowData } from '../useTaskData';
import { LabelPosition } from './LineElement';

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
): string {
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

export function lineColor(theme: DefaultTheme, grayed: boolean, state: string, isFirst: boolean): string {
  if (grayed) {
    return '#c7c7c7';
  } else {
    switch (state) {
      case 'completed':
      case 'ok':
        return !isFirst ? lighten(0.3, theme.color.bg.red) : theme.color.bg.green;
      case 'running':
        return theme.color.bg.yellow;
      case 'failed':
        return !isFirst ? lighten(0.3, theme.color.bg.red) : theme.color.bg.red;
      case 'unknown':
        return !isFirst ? lighten(0.3, theme.color.bg.dark) : theme.color.bg.dark;
      default:
        return lighten(0.5, theme.color.bg.dark);
    }
  }
}
