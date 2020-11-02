import React, { useEffect, useState, useCallback } from 'react';

import { Run as IRun, QueryParam } from '../../types';
import useResource from '../../hooks/useResource';

import { fromPairs, omit } from '../../utils/object';
import { pluck } from '../../utils/array';
import { parseOrderParam, directionFromText, swapDirection, DirectionText } from '../../utils/url';

import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import HomeSidebar from './Sidebar';
import HomeContentArea from './Content';
import { EventType } from '../../ws';

const defaultParams = {
  _order: '-ts_epoch',
  _limit: '15',
  _group_limit: '15',
  status: 'completed,failed,running',
};

export const HOMEFILTERS_KEY = 'home-filters';

const Home: React.FC = () => {
  //
  // State
  //

  const [page, setPage] = useState(1);
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
  });

  const activeParams = cleanParams(qp);
  // If we are grouping, we should have max 6 in one group.
  activeParams._group_limit = activeParams._group ? '6' : defaultParams._group_limit;

  const defaultFiltersActive = JSON.stringify(defaultParams) === JSON.stringify(activeParams);

  const resetAllFilters = useCallback(() => {
    // Reseting filter still keeps grouping settings as before.
    setQp({ ...defaultParams }, 'replace');
    localStorage.setItem(HOMEFILTERS_KEY, JSON.stringify({ ...defaultParams }));
  }, [setQp]);

  const handleParamChange = (key: string, value: string, keepFakeParams?: boolean) => {
    // We want to reset page when changing filters, but not when reordering
    if (!keepFakeParams) {
      setFakeParams(null);
      setPage(1);
    }
    setQp({ [key]: value });
    localStorage.setItem(HOMEFILTERS_KEY, JSON.stringify({ ...qp, [key]: value }));
  };

  // Update parameter list
  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(activeParams[key]));

    if (!vals.has(val)) {
      vals.add(val);
    } else {
      vals.delete(val);
    }

    handleParamChange(key, [...vals.values()].join(','));
  };

  //
  // Data
  //

  const { error, status, getResult } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: makeActiveRequestParameters({ ...activeParams, _page: String(page), ...(fakeParams || {}) }),
    //
    // onUpdate handles HTTP request updates. In practise on start OR when filters/sorts changes.
    // is most cases we want to replace existing data EXCEPT when we are loading next page.
    //
    onUpdate: (items) => {
      const newItems = items
        ? fromPairs<IRun[]>(
            pluck(activeParams._group, items).map((val) => [
              val as string,
              items.filter((r) => r[activeParams._group] === val),
            ]),
          )
        : {};

      // If we changed just page (of grouped items), we need to merge old and new result.
      // Also don't merge when using fakeParams since it means we are reordering, in that case everything needs to change.
      if (page > 1 && !fakeParams) {
        const merged = Object.keys(newItems).reduce((obj, key) => {
          const runs = newItems[key];

          if (obj[key]) {
            return { ...obj, [key]: obj[key].concat(runs) };
          }
          return { ...obj, [key]: runs };
        }, runGroups);

        setRunGroups(merged);
      } else {
        setRunGroups(newItems);
      }
    },
    //
    // On websocket update we want to merge, or add given result to existing groups (if any).
    // For now if we are not grouping, groupKey is 'undefined'
    //
    onWSUpdate: (item, eventType) => {
      const groupKey = item[activeParams._group] || 'undefined';
      if (typeof groupKey === 'string') {
        if (eventType === EventType.INSERT) {
          setRunGroups((rg) => {
            if (rg[groupKey]) {
              return { ...rg, [groupKey]: sortRuns([...rg[groupKey], item], activeParams._order) };
            }
            return { ...rg, [groupKey]: [item] };
          });
        } else if (eventType === EventType.UPDATE) {
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
      }
    },
    socketParamFilter: (params) => {
      // We need to remove status filter for websocket messages since we want to be able to track if
      // status changes from running to failed or completed even when we have status filter on
      if (params.status) {
        const { status, ...newparams } = params;
        return newparams;
      }
      return params;
    },
  });

  //
  // Event Handlers
  //

  const handleGroupTitleClick = (title: string) => {
    if (activeParams._group === 'flow_id') {
      setPage(1);
      setQp({ flow_id: title });
    } else if (activeParams._group === 'user_name') {
      setPage(1);
      // Remove other user tags
      const newtags = activeParams._tags
        ? activeParams._tags
            .split(',')
            .filter((str) => !str.startsWith('user:'))
            .concat([`user:${title}`])
            .join(',')
        : `user:${title}`;
      setQp({ _tags: newtags });
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
    if ((getResult().pages?.last || 0) <= page && !fakeParams) {
      return;
    }
    setFakeParams(null);
    setPage(page + 1);
  };

  //
  // Effects
  //

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
    // On start up check if we have no params AND if we have some old params on localstorage
    if (isDefaultParams(cleanParams(qp))) {
      const filtersFromLS = localStorage.getItem(HOMEFILTERS_KEY);
      if (filtersFromLS) {
        const settings = JSON.parse(filtersFromLS);
        if (settings) {
          setQp(settings, 'replace');
        } else {
          resetAllFilters();
        }
      } else {
        resetAllFilters();
      }
    } else {
      localStorage.setItem(HOMEFILTERS_KEY, JSON.stringify(activeParams));
    }
  }, [qp]); // eslint-disable-line

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <HomeSidebar
        handleParamChange={handleParamChange}
        updateListValue={updateListValue}
        params={activeParams}
        defaultFiltersActive={defaultFiltersActive}
        resetAllFilters={resetAllFilters}
      />

      <HomeContentArea
        error={error}
        status={status}
        params={activeParams}
        runGroups={runGroups}
        handleOrderChange={handleOrderChange}
        handleGroupTitleClick={handleGroupTitleClick}
        updateListValue={updateListValue}
        loadMore={handleLoadMore}
        targetCount={
          isGrouping(activeParams) ? parseInt(activeParams._group_limit) : parseInt(activeParams._limit) * page
        }
      />
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
    const value = qp[key];
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
  // We want to remove groupping from request in some cases
  // 1) When grouping is flow_id and only 1 flow_id filter is active, we want to show all runs of this group
  // 2) When grouping is user_name and only 1 user_name filter is active, we want to show all runs of this group
  if (params._group) {
    if (params._group === 'flow_id' && params.flow_id && params.flow_id.split(',').length === 1) {
      return omit(['_group'], params);
    } else if (params._group === 'user_name' && params._tags) {
      // Parse user tags from tags string and check if there is only 1
      const userTags = params._tags.split(',').filter((str) => str.startsWith('user:'));
      if (userTags.length === 1) {
        return omit(['_group'], params);
      }
    }
  }

  // Separate user tags from other so because they need to be handles with OR operator
  if (params._tags) {
    const userTags = params._tags.split(',').filter((str) => str.startsWith('user:'));
    if (userTags.length > 0) {
      // Remove tags from normal tags
      params._tags = params._tags
        .split(',')
        .filter((str) => !str.startsWith('user:'))
        .join(',');

      if (params._tags === '') {
        delete params._tags;
      }

      params['_tags:any'] = userTags.join(',');
    }
  }

  if (params._order && params._order.split(',').length === 1 && params._order.indexOf('ts_epoch') === -1) {
    params._order = `${params._order},ts_epoch`;
  }

  params._group_limit = String(parseInt(params._group_limit) + 1);

  return params;
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
// - Are grouping by user_name BUT have one user in user filters
// - have set grouping to none
//
export function isGrouping(params: Record<string, string>): boolean {
  if (params._group) {
    if (params._group === 'flow_id' && params.flow_id && params.flow_id.split(',').length === 1) {
      return false;
    } else if (params._group === 'user_name' && params._tags) {
      // Parse user tags from tags string and check if there is only 1
      const userTags = params._tags.split(',').filter((str) => str.startsWith('user:'));
      if (userTags.length === 1) {
        return false;
      }
    }
  } else {
    return false;
  }

  return true;
}

// Split possible query param to string array.
export function paramList(param: QueryParam): Array<string> {
  return param ? param.split(',').filter((p: string) => p !== '') : [];
}

// Generic string sorting
export const strSort = (dir: DirectionText, key: string) => (a: IRun, b: IRun): number => {
  const val1 = dir === 'down' ? a[key] : b[key];
  const val2 = dir === 'down' ? b[key] : a[key];

  if (val1 === val2 && key !== 'ts_epoch') {
    return nmbSort(dir, 'ts_epoch')(a, b);
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
  const val1 = dir === 'down' ? a[key] : b[key];
  const val2 = dir === 'down' ? b[key] : a[key];

  if (val1 === val2 && key !== 'ts_epoch') {
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
  } else if (key === 'user_name' || key === 'status' || key === 'flow_id') {
    return runs.sort(strSort(dir, key));
  }

  return runs;
}

export default Home;
