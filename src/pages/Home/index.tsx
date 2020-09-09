import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { Run as IRun, QueryParam } from '../../types';
import useResource from '../../hooks/useResource';

import { fromPairs } from '../../utils/object';
import { pluck } from '../../utils/array';
import { parseOrderParam, directionFromText, swapDirection } from '../../utils/url';
import { getPath } from '../../utils/routing';

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
  const [qp, setQp] = useQueryParams({
    _group: StringParam,
    _order: withDefault(StringParam, defaultParams._order),
    _limit: withDefault(StringParam, defaultParams._limit),
    _group_limit: withDefault(StringParam, '6'),
    _tags: StringParam,
    status: withDefault(StringParam, defaultParams.status),
    flow_id: StringParam,
  });

  const history = useHistory();
  const handleParamChange = (key: string, value: string) => {
    setPage(1);
    setQp({ [key]: value });
  };

  const activeParams = cleanParams(qp);
  activeParams._group_limit = activeParams._group ? '6' : '15';

  const resetAllFilters = useCallback(() => {
    setQp({ ...defaultParams, _group: activeParams._group }, 'replace');
  }, [setQp, activeParams]);

  const handleRunClick = (r: IRun) => history.push(getPath.dag(r.flow_id, r.run_number));

  const handleOrderChange = (orderProp: string) => {
    const [currentDirection, currentOrderProp] = parseOrderParam(qp._order);
    const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;
    handleParamChange('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder);
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

  const groupField: keyof IRun = activeParams._group;

  const [page, setPage] = useState(1);
  const [runGroups, setRunGroups] = useState<Record<string, IRun[]>>({});

  const { error, status, getResult } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: { ...activeParams, _page: String(page) },
    onUpdate: (items) => {
      const newItems = items
        ? fromPairs<IRun[]>(
            pluck(groupField, items).map((val) => [val as string, items.filter((r) => r[groupField] === val)]),
          )
        : {};

      // If we changed just page (of groupped items), we need to merge old and new result.
      if (page > 1) {
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
        handleRunClick={handleRunClick}
        loadMore={() => {
          if ((getResult().pages?.last || 0) <= page) {
            return;
          }
          setPage(page + 1);
        }}
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
