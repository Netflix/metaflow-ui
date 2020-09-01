import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun, RunStatus } from '../../../types';

import { getISOString } from '../../../utils/date';
import { flatten } from '../../../utils/array';
import { omit } from '../../../utils/object';
import { getPath } from '../../../utils/routing';

import useResource, { DataModel } from '../../../hooks/useResource';

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

const HeaderColumn = (props: {
  label: string;
  queryKey: string;
  onSort: (p: string) => void;
  currentOrder: string;
}) => <HeaderColumnBase {...props} />;

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
  const [rows, setRows] = useState<IRun[]>([]);

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

  useEffect(() => {
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

    setRows(uniqueRows(initialData.concat(cachedPages)));
  }, [initialData, page, result?.data]); // eslint-disable-line

  //
  // STICKY HEADER
  //

  const [isInViewport, targetRef] = useIsInViewport();

  const cols = [
    { label: t('fields.id'), key: 'run_number' },
    { label: t('fields.flow_id'), key: 'flow_id', hidden: field === 'flow_id' },
    { label: t('fields.user'), key: 'user_name', hidden: field === 'user_name' },
    { label: t('fields.status'), key: 'status' },
    { label: t('fields.started-at'), key: 'ts_epoch' },
    { label: t('fields.finished-at'), key: 'finished_at' },
    { label: t('fields.duration'), key: 'duration' },
  ].filter((item) => !item.hidden);

  const tableRef = useRef<HTMLTableElement>(null);
  const HeadContent = (
    <>
      <TR>
        <th colSpan={8} style={{ textAlign: 'left' }}>
          <h3>{fieldValue}</h3>
          {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
        </th>
      </TR>
      <TR>
        <StatusColorHeaderCell />
        {cols.map((col) => (
          <HeaderColumn
            key={col.key}
            label={col.label}
            queryKey={col.key}
            onSort={onOrderChange}
            currentOrder={localSearchParams['_order']}
          />
        ))}

        <th></th>
      </TR>
    </>
  );

  return (
    <StyledResultGroup ref={targetRef}>
      <Table cellPadding="0" cellSpacing="0" ref={tableRef}>
        {isInViewport && rows.length > 5 ? (
          <StickyHeader tableRef={tableRef}>{HeadContent}</StickyHeader>
        ) : (
          <thead>{HeadContent}</thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <TR key={`r-${i}`} onClick={() => onRunClick(r)}>
              {isInViewport ? (
                <>
                  <StatusColorCell status={r.status} />
                  <TD>
                    <span className="muted">#</span> <strong>{r.run_number}</strong>
                  </TD>
                  {field !== 'flow_id' && <TD>{r.flow_id}</TD>}
                  {field !== 'user_name' && <TD>{r.user_name}</TD>}
                  <TD>
                    <StatusField status={r.status} />
                  </TD>
                  <TD>{getISOString(new Date(r.ts_epoch))}</TD>
                  <TD>{!!r.finished_at ? getISOString(new Date(r.finished_at)) : false}</TD>
                  <TD>{r.duration ? formatDuration(r.duration, 0) : ''}</TD>
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
                </>
              ) : (
                <>
                  <TD colSpan={8}>
                    <div style={{ height: '32px' }}> </div>
                  </TD>
                </>
              )}
            </TR>
          ))}
        </tbody>
      </Table>
      {hasMoreItems(result, rows.length, Number(localSearchParams['_limit']), page) && (
        <Button className="load-more" onClick={() => loadMoreRuns()} size="sm" variant="primaryText" textOnly>
          {t('home.load-more-runs')} <Icon name="arrowDown" padLeft />
        </Button>
      )}
    </StyledResultGroup>
  );
};

function hasMoreItems(result: DataModel<IRun[]>, rowsAmount: number, limit: number, currentPage: number) {
  if (result?.pages) {
    return currentPage < result.pages.last;
  }

  return rowsAmount >= limit;
}

function uniqueRows(runs: IRun[]) {
  const ids = runs.map((item) => item.run_number);
  return runs.filter((item, index) => ids.indexOf(item.run_number) === index);
}

const StickyHeader: React.FC<{ tableRef: React.RefObject<HTMLTableElement> }> = ({ tableRef, children }) => {
  const scrollState = useState(0);

  useEffect(() => {
    const listener = () => {
      scrollState[1](window.scrollY);
    };

    window.addEventListener('scroll', listener);

    return () => window.removeEventListener('scroll', listener);
  }, []); // eslint-disable-line

  function shouldStick() {
    const rect = tableRef.current?.getBoundingClientRect();

    if (rect && rect.y < 112 && rect.y + rect.height > 210) {
      return true;
    }
    return false;
  }

  function fromTop() {
    const rect = tableRef.current?.getBoundingClientRect();
    return rect ? -(rect.y - 112) : 0;
  }

  const isSticky = shouldStick();

  return (
    <thead
      className={isSticky ? 'sticky' : ''}
      style={isSticky ? { transform: `translateY(${fromTop() - 15}px)` } : {}}
    >
      {children}
    </thead>
  );
};

export default ResultGroup;

export const StyledResultGroup = styled(Section)`
  margin-bottom: ${(p) => p.theme.spacer.hg}rem;

  table {
    margin-bottom: ${(p) => p.theme.spacer.sm}rem;
  }

  thead {
    background: #ffffff;

    h3:first-of-type {
      margin-top: 1rem;
    }
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
