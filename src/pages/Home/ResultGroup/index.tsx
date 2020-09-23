import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun, RunStatus } from '../../../types';

import { getISOString } from '../../../utils/date';

import { getPath } from '../../../utils/routing';

import { Section } from '../../../components/Structure';
import Icon from '../../../components/Icon';
import { Text, ForceNoBreakText } from '../../../components/Text';
import Table, { TR, TD, TH, HeaderColumn as HeaderColumnBase } from '../../../components/Table';
import Notification, { NotificationType } from '../../../components/Notification';
import StatusField from '../../../components/Status';
import { formatDuration } from '../../../utils/format';
import Button from '../../../components/Button';

const statusColors: RunStatus = {
  completed: 'green',
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
  label: string;
  resourceUrl: string;
  initialData: IRun[];
  queryParams: Record<string, string>;
  onOrderChange: (p: string) => void;
  handleGroupTitleClick: (title: string) => void;
  hideLoadMore?: boolean;
  targetCount: number;
};

const HeaderColumn = (props: {
  label: string;
  queryKey: string;
  onSort: (p: string) => void;
  currentOrder: string;
}) => <HeaderColumnBase {...props} />;

const ResultGroup: React.FC<Props> = ({
  label,
  initialData: rows,
  queryParams,
  onOrderChange,
  handleGroupTitleClick,
  targetCount,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  //
  // STICKY HEADER
  //
  const [isInViewport, targetRef] = useIsInViewport();

  const cols = [
    { label: t('fields.id'), key: 'run_number' },
    { label: t('fields.flow_id'), key: 'flow_id', hidden: queryParams._group === 'flow_id' },
    { label: t('fields.user'), key: 'user_name', hidden: queryParams._group === 'user_name' },
    { label: t('fields.status'), key: 'status' },
    { label: t('fields.started-at'), key: 'ts_epoch' },
    { label: t('fields.finished-at'), key: 'finished_at' },
    { label: t('fields.duration'), key: 'duration' },
  ].filter((item) => !item.hidden);

  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <StyledResultGroup ref={targetRef}>
      <Table cellPadding="0" cellSpacing="0" ref={tableRef}>
        {isInViewport && rows.length > 5 ? (
          <StickyHeader tableRef={tableRef}>
            <TableHeader
              handleClick={handleGroupTitleClick}
              error={null}
              cols={cols}
              onOrderChange={onOrderChange}
              order={queryParams['_order']}
              label={label}
            />
          </StickyHeader>
        ) : (
          <thead>
            <TableHeader
              handleClick={handleGroupTitleClick}
              error={null}
              cols={cols}
              onOrderChange={onOrderChange}
              order={queryParams['_order']}
              label={label}
            />
          </thead>
        )}
        <tbody>
          {rows.slice(0, targetCount).map((r, i) => (
            <TR key={`r-${i}`} clickable onClick={() => history.push(getPath.run(r.flow_id, r.run_number))}>
              <TableRows r={r} params={queryParams} historyPush={history.push} />
            </TR>
          ))}
        </tbody>
      </Table>

      {targetCount < rows.length && (
        <Button
          className="load-more"
          onClick={() => handleGroupTitleClick(label)}
          size="sm"
          variant="primaryText"
          textOnly
        >
          {t('home.show-all-runs')} <Icon name="arrowDown" rotate={-90} padLeft />
        </Button>
      )}
    </StyledResultGroup>
  );
};

type TableHeaderProps = {
  handleClick: (str: string) => void;
  error: Error | null;
  cols: { label: string; key: string; hidden?: boolean }[];
  onOrderChange: (p: string) => void;
  order: string;
  label: string;
};

const TableHeader: React.FC<TableHeaderProps> = ({ handleClick, error, cols, onOrderChange, order, label }) => (
  <>
    <TR>
      <th colSpan={cols.length + 2} style={{ textAlign: 'left' }}>
        <ResultGroupTitle onClick={() => handleClick(label)}>{label}</ResultGroupTitle>
        {error && <Notification type={NotificationType.Warning}>{error.message}</Notification>}
      </th>
    </TR>
    <TR>
      <StatusColorHeaderCell />
      {cols.map((col) => (
        <HeaderColumn key={col.key} label={col.label} queryKey={col.key} onSort={onOrderChange} currentOrder={order} />
      ))}

      <th></th>
    </TR>
  </>
);

type TableRowsProps = {
  r: IRun;
  params: Record<string, string>;
  historyPush: (url: string) => void;
};

const TableRows: React.FC<TableRowsProps> = React.memo(
  ({ r, params, historyPush }) => {
    const { t } = useTranslation();
    return (
      <>
        <StatusColorCell status={r.status} />
        <TD>
          <IDFieldContainer>
            <strong>{r.run_number}</strong>
          </IDFieldContainer>
        </TD>
        {params._group !== 'flow_id' && <TD>{r.flow_id}</TD>}
        {params._group !== 'user_name' && <TD>{r.user_name}</TD>}
        <TD>
          <ForceNoBreakText>
            <StatusField status={r.status} />
          </ForceNoBreakText>
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
              historyPush(getPath.run(r.flow_id, r.run_number));
            }}
          >
            <Icon name="timeline" size="lg" padRight />
            <Text>{t('run.timeline')}</Text>
          </Link>
        </TD>
      </>
    );
  },
  (prev, next) => {
    return prev.r == next.r; // eslint-disable-line
  },
);

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
  margin-bottom: ${(p) => p.theme.spacer.md}rem;

  table {
    margin-bottom: ${(p) => p.theme.spacer.sm}rem;
    word-break: break-all;
  }

  thead {
    background: #ffffff;
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
    color: ${(p) => p.theme.color.bg.blue};
  }
`;

const ResultGroupTitle = styled.h3`
  margin-top: 1rem;
  cursor: pointer;
  display: inline-block;

  &:hover {
    color: ${(p) => p.theme.color.text.blue};
  }
`;

const IDFieldContainer = styled.div``;
