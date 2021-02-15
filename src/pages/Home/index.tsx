import React, { useEffect, useState, useCallback } from 'react';

import { Run as IRun, QueryParam } from '../../types';
import useResource from '../../hooks/useResource';

import { omit } from '../../utils/object';
import { parseOrderParam, directionFromText, swapDirection, DirectionText } from '../../utils/url';

import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import HomeSidebar from './Sidebar';
import HomeContentArea from './Content';
import ErrorBoundary from '../../components/GeneralErrorBoundary';
import { useTranslation } from 'react-i18next';
import { logWarning } from '../../utils/errorlogger';

const defaultParams = {
  _order: '-ts_epoch',
  _limit: '15',
  _group_limit: '15',
  status: 'completed,failed,running',
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  //
  // State
  //

  const [page, setPage] = useState(1);
  // Temporary cache for newly arrived runs
  const [receivedRuns, setReceivedRuns] = useState<IRun[]>([]);
  const [runGroups, setRunGroups] = useState<Record<string, IRun[]>>({});
  // WARNING: These fake params are workaround for one special case. Generally when we are changing filters, we want to
  // reset page to start (page = 1). BUT when ordering stuff again, we want to keep same amount items as before. We don't
  // want to interfere pagination overall, but we need to fetch all new stuff in one request, so we store these fake params here
  // for one request.
  //
  // For example if we are in page 5 with limit 15, when we reorder fakeparams would be set to page=1&limit=75. However url params are kept
  // in page=5&limit15 so that when user scrolls down, we can fetch sixth page easily.
  //
  const [fakeParams, setFakeParams] = useState<{ _limit: string; _page: string } | null>(null);

  //
  // QueryParams
  //

  const [qp, setQp] = useQueryParams({
    _group: StringParam,
    _order: withDefault(StringParam, defaultParams._order),
    _limit: withDefault(StringParam, defaultParams._limit),
    _group_limit: withDefault(StringParam, defaultParams._group_limit),
    _tags: StringParam,
    status: withDefault(StringParam, defaultParams.status),
    flow_id: StringParam,
    user: StringParam,
  });

  const activeParams = cleanParams(qp);
  // If we are grouping, we should have max 6 in one group.
  activeParams._group_limit = activeParams._group ? '6' : defaultParams._group_limit;

  const defaultFiltersActive = JSON.stringify(defaultParams) === JSON.stringify(activeParams);

  const resetAllFilters = useCallback(() => {
    // Reseting filter still keeps grouping settings as before.
    setQp({ ...defaultParams }, 'replace');
  }, [setQp]);

  const [showLoader, setShowLoader] = useState(true);
  const [isLastPage, setLastPage] = useState(false);

  const handleParamChange = (key: string, value: string, keepFakeParams?: boolean) => {
    // We want to reset page when changing filters, but not when reordering
    // TODO: Make sense of this
    if (!keepFakeParams) {
      setFakeParams(null);
      setPage(1);
    }
    setShowLoader(true);

    setQp({ [key]: value || undefined });
  };

  // Update parameter list
  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(activeParams[key]));

    const value = val === 'None' ? 'null' : val;

    if (!vals.has(value)) {
      vals.add(value);
    } else {
      vals.delete(value);
    }

    handleParamChange(key, [...vals.values()].join(','));
  };

  //
  // Data
  //
  const requestParameters = makeActiveRequestParameters({
    ...activeParams,
    _page: String(page),
    ...(fakeParams || {}),
  });

  const { error, status, getResult } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    // If we are showing big loader, it means we are replacing all the data in view. In that case
    // we dont want websocket messages until we get the first response.
    subscribeToEvents: !showLoader,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: requestParameters,
    websocketParams: makeWebsocketParameters(requestParameters, runGroups, isLastPage),
    //
    // onUpdate handles HTTP request updates. In practice on start OR when filters/sorts changes.
    // is most cases we want to replace existing data EXCEPT when we are loading next page.
    //
    onUpdate: (items) => {
      // Remove old data if we are in first page/we handle fake params
      // NOTE: This is in wrong place. We should probably clear earlier
      if (page === 1 || fakeParams) {
        setRunGroups({});
      }
      setReceivedRuns((runs) => runs.concat(items));
    },
    //
    // On websocket update we want to merge, or add given result to existing groups (if any).
    // For now if we are not grouping, groupKey is 'undefined'
    //
    onWSUpdate: (item: IRun) => {
      setReceivedRuns((runs) => runs.concat([item]));
    },
    postRequest() {
      setShowLoader(false);
      setFakeParams(null);
    },
  });

  //
  // Event Handlers
  //

  const handleGroupTitleClick = (title: string) => {
    if (['flow_id', 'user'].indexOf(activeParams._group) > -1) {
      setPage(1);
      setShowLoader(true);
      setRunGroups({});
      setReceivedRuns([]);

      if (activeParams._group === 'flow_id') {
        setQp({ flow_id: title });
      } else if (activeParams._group === 'user') {
        const param = title === 'None' ? 'null' : title;
        // Remove other user tags
        const newtags = activeParams._tags
          ? activeParams._tags
              .split(',')
              .filter((str) => !str.startsWith('user:'))
              .join(',')
          : '';
        setQp({ _tags: newtags, user: param });
      }
    }
  };

  const handleOrderChange = (orderProp: string) => {
    const [currentDirection, currentOrderProp] = parseOrderParam(qp._order);
    const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;

    if (page > 1) {
      setFakeParams({ _limit: String(parseInt(activeParams._limit) * page), _page: '1' });
    }

    handleParamChange('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder, true);
  };

  const handleLoadMore = () => {
    if (fakeParams) return;
    if (getResult()?.pages?.next === null || 9999 <= page) return;
    if (showLoader) return;
    setPage(page + 1);
  };

  //
  // Effects
  //

  useEffect(() => {
    if (receivedRuns.length > 0) {
      receivedRuns.forEach((item) => {
        try {
          const groupKey = item[activeParams._group] || 'undefined';
          if (typeof groupKey === 'string') {
            setRunGroups((rg) => {
              if (rg[groupKey]) {
                const index = rg[groupKey].findIndex((r) => r.run_number === item.run_number);
                return {
                  ...rg,
                  [groupKey]:
                    index > -1
                      ? sortRuns(
                          rg[groupKey].map((r) => (r.run_number === item.run_number ? item : r)),
                          activeParams._order,
                        )
                      : sortRuns([...rg[groupKey], item], activeParams._order),
                };
              }
              return { ...rg, [groupKey]: [item] };
            });
          }
        } catch (e) {
          logWarning('Unexpected error on websocket updates: ', e);
        }
      });
      setReceivedRuns([]);
    }
  }, [activeParams._order, activeParams._group, receivedRuns]);

  useEffect(() => {
    if (Object.keys(cleanParams(activeParams)).length === 0) {
      resetAllFilters();
    }
  }, [activeParams, resetAllFilters]);

  // Jump to page 1 if we change filters
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [activeParams.flow_id, activeParams._tags, activeParams.status, activeParams._group]); // eslint-disable-line

  useEffect(() => {
    const next = getResult()?.pages?.next;
    if (next === null) {
      setLastPage(true);
    } else if (typeof next === 'number') {
      setLastPage(false);
    }
  }, [getResult]);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <ErrorBoundary message={t('error.sidebar-error')}>
        <HomeSidebar
          handleParamChange={handleParamChange}
          updateListValue={updateListValue}
          params={activeParams}
          defaultFiltersActive={defaultFiltersActive}
          resetAllFilters={resetAllFilters}
        />
      </ErrorBoundary>

      <ErrorBoundary message={t('home-error')}>
        <HomeContentArea
          error={error}
          status={status}
          showLoader={showLoader}
          params={activeParams}
          runGroups={runGroups}
          handleOrderChange={handleOrderChange}
          handleGroupTitleClick={handleGroupTitleClick}
          updateListValue={updateListValue}
          loadMore={handleLoadMore}
          targetCount={
            isGrouping(activeParams) ? parseInt(activeParams._group_limit) : parseInt(activeParams._limit) * page
          }
          grouping={isGrouping(activeParams)}
        />
      </ErrorBoundary>
    </div>
  );
};

//
// Helper functions
//

//
// Make sure that params object is type of Record<string, string>
//
function cleanParams(qp: any): Record<string, string> {
  return Object.keys(qp).reduce((obj, key) => {
    // Unfortunately withDefault of use-query-params does not default in case of empty string so we need to
    // assing default value for status here by hand
    const value = key === 'status' && qp[key] === '' ? defaultParams.status : qp[key];
    if (value) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
}

//
//
//

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

function makeWebsocketParameters(
  params: Record<string, string>,
  runGroups: Record<string, IRun[]>,
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
      const value = lastItem[firstOrderKey];
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
      params._order === defaultParams._order &&
      params._limit === defaultParams._limit &&
      params.status === defaultParams.status
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
export const strSort = (dir: DirectionText, key: string) => (a: IRun, b: IRun): number => {
  const val1 = dir === 'up' ? a[key] : b[key];
  const val2 = dir === 'up' ? b[key] : a[key];

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
export const nmbSort = (dir: DirectionText, key: string) => (a: IRun, b: IRun): number => {
  const val1 = dir === 'up' ? a[key] : b[key];
  const val2 = dir === 'up' ? b[key] : a[key];

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
export function sortRuns(runs: IRun[], order: string): IRun[] {
  const [dir, key] = parseOrderParam(order);

  if (key === 'ts_epoch' || key === 'duration' || key === 'finished_at') {
    return runs.sort(nmbSort(dir, key));
  } else if (key === 'user' || key === 'status' || key === 'flow_id' || key === 'run') {
    return runs.sort(strSort(dir, key));
  }

  return runs;
}

export default Home;
