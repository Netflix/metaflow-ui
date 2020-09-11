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
  status: 'running,completed,failed',
};

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
    _group_limit: withDefault(StringParam, '6'),
    _tags: StringParam,
    status: withDefault(StringParam, defaultParams.status),
    flow_id: StringParam,
  });

  const activeParams = cleanParams(qp);
  activeParams._group_limit = activeParams._group ? '6' : '15';

  const resetAllFilters = useCallback(() => {
    setQp({ ...defaultParams, _group: activeParams._group }, 'replace');
  }, [setQp, activeParams]);

  const handleParamChange = (key: string, value: string, keepFakeParams?: boolean) => {
    // We want to reset page when changing filters, but not when reordering
    if (!keepFakeParams) {
      setFakeParams(null);
      setPage(1);
    }
    setQp({ [key]: value });
  };

  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(activeParams[key]));

    if (!vals.has(val)) {
      vals.add(val);
    } else {
      vals.delete(val);
    }

    handleParamChange(key, [...vals.values()].join(','));
  };

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [activeParams.flow_id, activeParams._tags, activeParams.status, activeParams._group]);

  //
  // Data
  //

  function isGrouping() {
    if (activeParams._group) {
      if (activeParams._group === 'flow_id' && activeParams.flow_id && activeParams.flow_id.split(',').length === 1) {
        return false;
      } else if (activeParams._group === 'user_name' && activeParams._tags) {
        // Parse user tags from tags string and check if there is only 1
        const userTags = activeParams._tags.split(',').filter((str) => str.startsWith('user:'));
        if (userTags.length === 1) {
          return false;
        }
      }
    } else {
      return false;
    }

    return true;
  }

  function makeParams() {
    const params: Record<string, string> = { ...activeParams, _page: String(page), ...(fakeParams || {}) };

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

    params._group_limit = String(parseInt(params._group_limit) + 1);

    return params;
  }

  const { error, status, getResult } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: makeParams(),
    onUpdate: (items) => {
      const newItems = items
        ? fromPairs<IRun[]>(
            pluck(activeParams._group, items).map((val) => [
              val as string,
              items.filter((r) => r[activeParams._group] === val),
            ]),
          )
        : {};

      // If we changed just page (of groupped items), we need to merge old and new result.
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

  useEffect(() => {
    if (isDefaultParams(activeParams)) {
      resetAllFilters();
    }
  }, []); // eslint-disable-line

  return (
    <>
      <HomeSidebar
        handleParamChange={handleParamChange}
        updateListValue={updateListValue}
        params={activeParams}
        resetAllFilters={resetAllFilters}
      />

      <HomeContentArea
        error={error}
        status={status}
        params={activeParams}
        runGroups={runGroups}
        handleOrderChange={handleOrderChange}
        handleGroupTitleClick={handleGroupTitleClick}
        loadMore={handleLoadMore}
        targetCount={isGrouping() ? parseInt(activeParams._group_limit) : parseInt(activeParams._limit) * page}
      />
    </>
  );
};

function cleanParams(qp: any): Record<string, string> {
  return Object.keys(qp).reduce((obj, key) => {
    const value = qp[key];
    if (value) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
}

export function isDefaultParams(params: Record<string, string>): boolean {
  if (Object.keys(params).length === 3) {
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

export function paramList(param: QueryParam): Array<string> {
  return param ? param.split(',').filter((p: string) => p !== '') : [];
}

const strSort = (dir: DirectionText, key: string) => (a: IRun, b: IRun) => {
  const val1 = dir === 'down' ? a[key] : b[key];
  const val2 = dir === 'down' ? b[key] : a[key];

  if (typeof val1 === 'string' && typeof val2 === 'string') {
    return val1.toUpperCase() > val2.toUpperCase() ? 1 : val1.toUpperCase() < val2.toUpperCase() ? -1 : 0;
  }

  return 0;
};

const nmbSort = (dir: DirectionText, key: string) => (a: IRun, b: IRun) => {
  const val1 = dir === 'down' ? a[key] : b[key];
  const val2 = dir === 'down' ? b[key] : a[key];

  if (typeof val1 === 'number' && typeof val2 === 'number') {
    return val1 - val2;
  }

  return 0;
};

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
