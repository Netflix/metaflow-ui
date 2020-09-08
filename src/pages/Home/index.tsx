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
import MemoContentArea from './Content';

export interface DefaultQuery {
  _group: 'string';
  _order: 'string';
  _limit: 'string';
}

const defaultParams = {
  _group: 'flow_id',
  _order: '-ts_epoch',
  _limit: '6',
  status: 'running,completed,failed',
};

export const defaultQuery = new URLSearchParams(defaultParams);

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

export function paramList(param: QueryParam): Array<string> {
  return param ? param.split(',').filter((p: string) => p !== '') : [];
}

const Home: React.FC = () => {
  const [qp, setQp] = useQueryParams({
    _group: withDefault(StringParam, 'flow_id'),
    _order: withDefault(StringParam, '-ts_epoch'),
    _limit: withDefault(StringParam, '6'),
    _group_limit: withDefault(StringParam, '6'),
    _tags: StringParam,
    status: withDefault(StringParam, 'running,completed,failed'),
    flow_id: StringParam,
  });

  const history = useHistory();
  const handleParamChange = (key: string, value: string) => {
    setQp({ [key]: value });
  };
  const getQueryParam: (props: string) => string = (prop: string) => (qp as any)[prop] || (defaultParams as any)[prop];
  const getDefaultedQueryParam = (prop: keyof DefaultQuery) => getQueryParam(prop) as string;
  const getAllDefaultedQueryParams = () => ({
    ...defaultParams,
    ...cleanParams(qp as any),
  });
  const activeParams = getAllDefaultedQueryParams();

  const resetAllFilters = useCallback(() => {
    setQp({ ...defaultParams, _group: activeParams._group }, 'replace');
  }, [setQp, activeParams]);

  const handleRunClick = (r: IRun) => history.push(getPath.dag(r.flow_id, r.run_number));

  const handleOrderChange = (orderProp: string) => {
    const [currentDirection, currentOrderProp] = parseOrderParam(getDefaultedQueryParam('_order'));
    const nextOrder = `${directionFromText(currentDirection)}${orderProp}`;
    handleParamChange('_order', currentOrderProp === orderProp ? swapDirection(nextOrder) : nextOrder);
  };

  const updateListValue = (key: string, val: string) => {
    const vals = new Set(paramList(getQueryParam(key)));

    if (!vals.has(val)) {
      vals.add(val);
    } else {
      vals.delete(val);
    }

    handleParamChange(key, [...vals.values()].join(','));
  };

  const groupField: keyof IRun = getDefaultedQueryParam('_group');

  const { data: runs, error, status } = useResource<IRun[], IRun>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: activeParams,
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

  const [runGroups, setRunGroups] = useState<Record<string, IRun[]>>({});

  useEffect(() => {
    setRunGroups(
      runs
        ? fromPairs<IRun[]>(
            pluck(groupField, runs).map((val) => [val as string, runs.filter((r) => r[groupField] === val)]),
          )
        : {},
    );
  }, [runs]); // eslint-disable-line

  return (
    <>
      <HomeSidebar
        getQueryParam={getQueryParam}
        getDefaultedQueryParam={getDefaultedQueryParam}
        handleParamChange={handleParamChange}
        updateListValue={updateListValue}
        params={activeParams}
        resetAllFilters={resetAllFilters}
      />

      <MemoContentArea
        error={error}
        status={status}
        params={cleanParams(qp as any)}
        runGroups={runGroups}
        handleOrderChange={handleOrderChange}
        handleRunClick={handleRunClick}
      />
    </>
  );
};

function cleanParams(qp: Record<string, string>): Record<string, string> {
  return Object.keys(qp).reduce((obj, key) => {
    const value = qp[key];
    if (value) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
}

export default Home;
