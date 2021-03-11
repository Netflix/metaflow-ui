import { GraphSortBy, GraphState } from '../../components/Timeline/useGraph';
import { RowDataModel } from '../../components/Timeline/useRowData';
import { Row } from '../../components/Timeline/VirtualizedTimeline';
import { SearchResultModel } from '../../hooks/useSearchField';
import { Task } from '../../types';
import { getPath } from '../../utils/routing';
import { getTaskId } from '../../utils/task';

export function cleanParametersMap(params: any): Record<string, string> {
  return Object.keys(params).reduce((obj, key) => {
    if (params[key]) {
      return { ...obj, [key]: params[key] };
    }
    return obj;
  }, {});
}

/**
 * See if viewType parameter matches actual view types
 * @param viewType Possible viewType string from url
 */
export function hasViewTypeParam(viewType?: string): viewType is string {
  return !!(viewType && ['dag', 'timeline', 'task'].indexOf(viewType) > -1);
}

/**
 * Merge two strings separated with ?
 * @param url
 * @param params
 */
export function addParamsToUrl(url: string, params: string): string {
  return `${url}${params && params.length > 0 ? '?' + params : ''}`;
}

/**
 * Figure out link for task page. IF we have previous task id, return link back to that. If not,
 * try to find first task from rows
 * @param flowId
 * @param runNumber
 * @param previousStepName
 * @param previousTaskId
 * @param urlParams Additional parameters string to be added for url
 * @param rows All rows in RowDataModel
 */
export function getTaskPageLink(
  flowId: string,
  runNumber: string,
  previousStepName: string | undefined,
  previousTaskId: string | undefined,
  urlParams: string,
  rows: RowDataModel,
): string {
  if (previousStepName && previousTaskId) {
    return addParamsToUrl(getPath.task(flowId, runNumber, previousStepName, previousTaskId), urlParams);
  } else {
    const startStep = rows['start'];
    if (startStep && Object.keys(startStep.data).length > 0) {
      const taskKey = Object.keys(startStep.data)[0];
      const task = startStep.data[taskKey];

      if (task && task.length > 0) {
        const taskId = getTaskId(task[0]);
        return addParamsToUrl(getPath.task(flowId, runNumber, 'start', taskId), urlParams);
      }
    }
  }

  return addParamsToUrl(getPath.tasks(flowId, runNumber), urlParams);
}

/**
 * Try to find task from rowdatamodel with stepname and taskid
 * @param model Row data model
 * @param stepName Name of step of task we want to find
 * @param taskId Id of task we want to find
 */
export function getTaskFromList(
  model: RowDataModel,
  stepName: string | undefined,
  taskId: string | undefined,
): Task[] | null {
  if (!stepName || !taskId || !model[stepName]) return null;

  const stepTasks = model[stepName].data;
  const match = Object.keys(stepTasks).find((id) => {
    const task = stepTasks[id][0];
    if (!task) return false;
    return task.task_name === taskId || task.task_id.toString() === taskId;
  });

  return match ? model[stepName].data[match] : null;
}

/**
 * Transform row data to actual filtered and sorted row objects we can render
 * @param rowDataState All received row data
 * @param graph Timeline graphics object
 * @param visibleSteps List of visible steps (filter)
 * @param searchResults Search result object
 */
export function makeVisibleRows(
  rowDataState: RowDataModel,
  graph: GraphState,
  visibleSteps: string[],
  searchResults: SearchResultModel,
): Row[] {
  const matchIds = searchResults.result.map((item) => item.task_id);

  return visibleSteps.reduce((arr: Row[], currentStepName: string): Row[] => {
    const rowData = rowDataState[currentStepName];

    if (!rowData) return arr;

    // If step row is open, add its tasks to the list.
    let rowTasks = Object.keys(rowData.data).map((item) => ({
      type: 'task' as const,
      data: rowData.data[item],
    }));

    if (graph.statusFilter) {
      rowTasks = rowTasks.filter((item) => {
        const lastTask = item.data.slice(-1)[0];
        return lastTask?.status === graph.statusFilter;
      });
    }

    if (shouldApplySearchFilter(searchResults)) {
      rowTasks = rowTasks.filter((item) => matchIds.indexOf(item.data[0]?.task_id?.toString()) > -1);
    }

    return rowTasks.length === 0
      ? arr
      : arr.concat(
          graph.group && rowData.step ? [{ type: 'step' as const, data: rowData.step, rowObject: rowData }] : [],
          rowData.isOpen || !graph.group
            ? graph.group
              ? rowTasks.sort(sortRows(graph.sortBy, graph.sortDir))
              : rowTasks
            : [],
        );
  }, []);
}

/**
 * Simple check if we should use search filter
 * @param results
 */
export function shouldApplySearchFilter(results: SearchResultModel): boolean {
  return results.status !== 'NotAsked';
}

/**
 * Safely get row start time
 * @param row
 */
export function getRowStartTime(row: Row): number {
  if (row.type === 'task') {
    return row.data[0].started_at || row.data[0].ts_epoch;
  }
  return 0;
}

/**
 * Safely get row end time
 * @param row
 */
export function getRowFinishedTime(row: Row): number {
  if (row.type === 'task') {
    const lastTask = row.data[row.data.length - 1];
    return lastTask ? lastTask.finished_at || lastTask.ts_epoch : 0;
  }
  return 0;
}

/**
 * Safely get task duration. Note that we are using FULL task time so end time of LAST attempt and
 * start time of FIRST attempt
 * @param a
 */
export function taskDuration(a: Row): number {
  if (a.type === 'task') {
    return getRowFinishedTime(a) - getRowStartTime(a);
  }
  return 0;
}

/**
 *
 * @param sortBy
 * @param sortDir
 */
export function sortRows(sortBy: GraphSortBy, sortDir: 'asc' | 'desc'): (a: Row, b: Row) => number {
  return (a: Row, b: Row) => {
    const fst = sortDir === 'asc' ? a : b;
    const snd = sortDir === 'asc' ? b : a;

    if (sortBy === 'startTime' && fst.type === 'task' && snd.type === 'task') {
      return getRowStartTime(fst) - getRowStartTime(snd);
    }
    if (sortBy === 'endTime' && fst.type === 'task' && snd.type === 'task') {
      return getRowFinishedTime(fst) - getRowFinishedTime(snd);
    } else if (sortBy === 'duration') {
      return taskDuration(fst) - taskDuration(snd);
    }

    return 0;
  };
}
