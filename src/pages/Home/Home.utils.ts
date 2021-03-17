import { QueryParam, Run } from '../../types';
import { omit } from '../../utils/object';
import { DirectionText, parseOrderParam } from '../../utils/url';
import { defaultHomeParameters } from './useHomeParameters';

export function makeActiveRequestParameters(params: Record<string, string>): Record<string, string> {
  let newParams = { ...params };
  // We want to remove groupping from request in some cases
  // 1) When grouping is flow_id and only 1 flow_id filter is active, we want to show all runs of this group
  // 2) When grouping is user and only 1 user filter is active, we want to show all runs of this group
  if (newParams._group) {
    if (newParams._group === 'flow_id' && hasOne(newParams.flow_id)) {
      newParams = omit(['_group'], newParams);
    } else if (newParams._group === 'user' && hasOne(newParams.user)) {
      newParams = omit(['_group'], newParams);
    }
  }

  if (hasOne(newParams._order) && (newParams._order.indexOf('flow_id') > -1 || newParams._order.indexOf('user') > -1)) {
    newParams._order = `${newParams._order},ts_epoch`;
  }

  newParams._group_limit = String(parseInt(newParams._group_limit) + 1);

  if (newParams.status && newParams.status.split(',').length === 3) {
    delete newParams.status;
  }

  return newParams;
}

export function makeWebsocketParameters(
  params: Record<string, string>,
  runGroups: Record<string, Run[]>,
  isLastPage: boolean,
): Record<string, string> {
  const { status, _page, _group, _limit, _group_limit, _order, ...rest } = params;
  let newparams = rest;

  const groupKeys = Object.keys(runGroups);
  // We need to remove status filter for websocket messages since we want to be able to track if
  // status changes from running to failed or completed even when we have status filter on
  if (params.status && params.status !== 'running') {
    newparams = { ...newparams, status };
  }

  // If we are grouping by user or flow, we want to subscribe only to visible groups. So we add parameter
  // user:lte or flow_id:lte with last group. (lower than or equal works since groups are in alphabetical order)
  if (params._group) {
    newparams = {
      ...newparams,
      ...(groupKeys.length > 0 && !isLastPage
        ? { [params._group === 'user' ? 'user:le' : 'flow_id:le']: groupKeys[groupKeys.length - 1] }
        : {}),
    };
  } else {
    const data = runGroups['undefined'];

    if (data?.length > 0 && _order && !isLastPage) {
      const lastItem = data[data.length - 1];
      const [dir, key] = parseOrderParam(_order);
      const firstOrderKey = key.split(',')[0];
      const value = lastItem[firstOrderKey as keyof Run];
      if (value) {
        newparams = {
          ...newparams,
          [`${firstOrderKey}:${dir === 'up' ? 'le' : 'ge'}`]: value as string,
        };
      }
    }
  }

  return newparams;
}

//
// Check if current parameters are default params
//
export function isDefaultParams(params: Record<string, string>): boolean {
  if (Object.keys(params).length === 4) {
    if (
      params._order === defaultHomeParameters._order &&
      params._limit === defaultHomeParameters._limit &&
      params.status === defaultHomeParameters.status
    ) {
      return true;
    }
  }
  return false;
}

//
// See if we are grouping view. We are not grouping if we:
// - Are grouping by flow_ID BUT have one flow in flow filters
// - Are grouping by user BUT have one user in user filters
// - have set grouping to none
//
export function isGrouping(params: Record<string, string>): boolean {
  if (params._group) {
    if (params._group === 'flow_id' && hasOne(params.flow_id)) {
      return false;
    } else if (params._group === 'user' && hasOne(params.user)) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

function hasOne(str: string) {
  return !!(str && str.split(',').length === 1);
}

// Split possible query param to string array.
export function paramList(param: QueryParam): Array<string> {
  return param ? param.split(',').filter((p: string) => p !== '') : [];
}

const shouldUseTiebreaker = (
  a: string | number | string[] | null | undefined,
  b: string | number | string[] | null | undefined,
  key: string,
) => {
  return a === b && key !== 'ts_epoch' && ['flow_id', 'user'].indexOf(key) > -1;
};

// Generic string sorting
export const strSort = (dir: DirectionText, key: string) => (a: Run, b: Run): number => {
  const val1 = dir === 'up' ? a[key as keyof Run] : b[key as keyof Run];
  const val2 = dir === 'up' ? b[key as keyof Run] : a[key as keyof Run];

  // Only use ts_epoch tiebreaker with flow_id or user
  if (shouldUseTiebreaker(val1, val2, key)) {
    return nmbSort('down', 'ts_epoch')(a, b);
  }

  if (typeof val1 === 'string' && typeof val2 === 'string') {
    return val1.toUpperCase() > val2.toUpperCase() ? 1 : val1.toUpperCase() < val2.toUpperCase() ? -1 : 0;
  } else if (typeof val1 === 'string') {
    return -1;
  } else if (typeof val2 === 'string') {
    return 1;
  }

  return 0;
};

// Generic number sorting
export const nmbSort = (dir: DirectionText, key: string) => (a: Run, b: Run): number => {
  const val1 = dir === 'up' ? a[key as keyof Run] : b[key as keyof Run];
  const val2 = dir === 'up' ? b[key as keyof Run] : a[key as keyof Run];

  // Only use ts_epoch tiebreaker with flow_id or user
  if (shouldUseTiebreaker(val1, val2, key)) {
    return nmbSort(dir, 'ts_epoch')(a, b);
  }

  if (typeof val1 === 'number' && typeof val2 === 'number') {
    return val1 - val2;
  } else if (typeof val1 === 'number') {
    return -1;
  } else if (typeof val2 === 'number') {
    return 1;
  }

  return 0;
};

//
// We sort list on client side as well so we can align websocket updates properly
//
export function sortRuns(runs: Run[], order: string): Run[] {
  const [dir, key] = parseOrderParam(order);

  if (key === 'ts_epoch' || key === 'duration' || key === 'finished_at') {
    return runs.sort(nmbSort(dir, key));
  } else if (key === 'user' || key === 'status' || key === 'flow_id' || key === 'run') {
    return runs.sort(strSort(dir, key));
  }

  return runs;
}
