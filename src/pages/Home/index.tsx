import React, { useEffect, useState, useCallback } from 'react';

import { Run as IRun, QueryParam } from '../../types';
import useResource from '../../hooks/useResource';

import { fromPairs } from '../../utils/object';
import { pluck } from '../../utils/array';
import { parseOrderParam, directionFromText, swapDirection } from '../../utils/url';

import { useQueryParams, StringParam, withDefault } from 'use-query-params';
import HomeSidebar from './Sidebar';
import HomeContentArea from './Content';

export interface DefaultQuery {
  _group: 'string';
  _order: 'string';
  _limit: 'string';
}

const defaultParams = {
  // _group: 'flow_id',
  _order: '-ts_epoch',
  _limit: '15',
  status: 'running,completed,failed',
};

export const defaultQuery = new URLSearchParams(defaultParams);

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

  //
  // Data
  //

  const { error, status, getResult } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: { ...activeParams, _page: String(page), ...(fakeParams || {}) },
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

export default Home;
