import React, { useState, useLayoutEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Run as IRun, RunStatus } from '../../../types';

import { getISOString } from '../../../utils/date';
import { flatten } from '../../../utils/array';
import { omit } from '../../../utils/object';
import { getPath } from '../../../utils/routing';

import useResource from '../../../hooks/useResource';

import { Section } from '../../../components/Structure';
import Icon from '../../../components/Icon';
import Button from '../../../components/Button';
import { Text } from '../../../components/Text';
import Table, { TR, TD, TH, HeaderColumn as HeaderColumnBase } from '../../../components/Table';
import Notification, { NotificationType } from '../../../components/Notification';
import StatusField from '../../../components/Status';
import { formatDuration } from '../../../utils/format';

const statusColors: RunStatus = {
  completed: 'white',
  running: 'yellow',
  failed: 'red',
};

const statusCellCSS = css`
  width: 0.25rem;
  padding: 1px;
`;

export const StatusColorCell = styled(TD)<{ status: keyof RunStatus }>`
  background: ${(p) => p.theme.color.bg[statusColors[p.status]] || 'transparent'} !important;
  ${statusCellCSS};
`;

export const StatusColorHeaderCell = styled(TH)`
  ${statusCellCSS};
`;

type Props = {
  field: string;
  fieldValue: string;
  resourceUrl: string;
  initialData: IRun[];
  queryParams: Record<string, string>;
  onRunClick: (r: IRun) => void;
  onOrderChange: (p: string) => void;
};

const ResultGroup: React.FC<Props> = ({
  field,
  fieldValue,
  resourceUrl,
  initialData,
  queryParams,
  onRunClick,
  onOrderChange,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [page, setPage] = useState(1);
  const loadMoreRuns = () => setPage(page + 1);
  const localSearchParams = omit(['_group'], {
    ...queryParams,
    [field]: fieldValue,
    _page: String(page),
  });

  const { error, getResult, cache, target } = useResource<IRun[], IRun>({
    url: resourceUrl,
    initialData,
    subscribeToEvents: true,
    updatePredicate: (a, b) => a.flow_id === b.flow_id && a.run_number === b.run_number,
    queryParams: localSearchParams,
    pause: page === 1,
  });

  const pageInvalidationStr = new URLSearchParams(queryParams).toString();

  useLayoutEffect(() => setPage(1), [pageInvalidationStr]);

  const { origin, pathname } = new URL(target);
  const result = getResult();

  const cachedPages: IRun[] = flatten(
    Array(page)
      .fill('')
      .map((_, i) => {
        const cacheKey = `${origin}${pathname}?${new URLSearchParams({
          ...localSearchParams,
          _page: String(i + 1),
        }).toString()}`;
        return cache.get(cacheKey)?.data as IRun[];
      }),
  ).filter((x: IRun | undefined) => !!x);

  const allRuns = uniqueRows(initialData.concat(cachedPages));

  const HeaderColumn = (props: { label: string; queryKey: string }) => (
    <HeaderColumnBase {...props} onSort={onOrderChange} currentOrder={localSearchParams['_order']} />
  );

  return (
    <StyledResultGroup>
      <h3>{fieldValue}</h3>
      {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
      <Table cellPadding="0" cellSpacing="0">
        <thead>
          <TR>
            <StatusColorHeaderCell />
            <HeaderColumn label={t('fields.id')} queryKey="run_number" />
            {field !== 'flow_id' && <HeaderColumn label={t('fields.flow_id')} queryKey="flow_id" />}
            <HeaderColumn label={t('fields.status')} queryKey="status" />
            <HeaderColumn label={t('fields.started-at')} queryKey="ts_epoch" />
            <HeaderColumn label={t('fields.finished-at')} queryKey="finished_at" />
            <HeaderColumn label={t('fields.duration')} queryKey="duration" />
            <HeaderColumn label={t('fields.user')} queryKey="user_name" />
          </TR>
        </thead>
        <tbody>
          {allRuns.map((r, i) => (
            <TR key={`r-${i}`} onClick={() => onRunClick(r)}>
              <StatusColorCell status={r.status} />
              <TD>
                <span className="muted">#</span> <strong>{r.run_number}</strong>
              </TD>
              {field !== 'flow_id' && <TD>{r.flow_id}</TD>}
              <TD>
                <StatusField status={r.status} />
              </TD>
              <TD>{getISOString(new Date(r.ts_epoch))}</TD>
              <TD>{!!r.finished_at ? getISOString(new Date(r.finished_at)) : false}</TD>
              <TD>{r.duration ? formatDuration(r.duration, 0) : ''}</TD>
              <TD>{r.user_name}</TD>
              <TD className="timeline-link">
                <Link
                  to={getPath.run(r.flow_id, r.run_number)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    history.push(getPath.run(r.flow_id, r.run_number));
                  }}
                >
                  <Icon name="timeline" size="lg" padRight />
                  <Text>Timeline</Text>
                </Link>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {result?.pages?.last !== page && allRuns.length >= Number(localSearchParams['_limit']) && (
        <Button className="load-more" onClick={() => loadMoreRuns()} size="sm" variant="primaryText" textOnly>
          {t('home.load-more-runs')} <Icon name="arrowDown" padLeft />
        </Button>
      )}
    </StyledResultGroup>
  );
};

function uniqueRows(runs: IRun[]) {
  const ids = runs.map((item) => item.run_number);
  return runs.filter((item, index) => ids.indexOf(item.run_number) === index);
}

export default ResultGroup;

export const StyledResultGroup = styled(Section)`
  margin-bottom: ${(p) => p.theme.spacer.hg}rem;

  table {
    margin-bottom: ${(p) => p.theme.spacer.sm}rem;
  }

  td.timeline-link {
    width: 7.4rem;
  }

  td.timeline-link a {
    text-decoration: none;
    color: ${(p) => p.theme.color.text.light};
    white-space: nowrap;
    display: flex;
    align-items: center;
  }

  tr:hover td.timeline-link a {
    color: ${(p) => p.theme.color.text.blue};

    svg #line1 {
      color: ${(p) => p.theme.color.bg.red};
    }
    svg #line2 {
      color: ${(p) => p.theme.color.bg.yellow};
    }
  }
`;
