import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun, RunStatus } from '../../../types';
import { getISOString } from '../../../utils/date';
import { getPath } from '../../../utils/routing';
import { formatDuration } from '../../../utils/format';

import Table, { TR, TD, TH, HeaderColumn as HeaderColumnBase } from '../../../components/Table';
import { ForceNoBreakText } from '../../../components/Text';
import Label, { LabelType } from '../../../components/Label';
import { Section } from '../../../components/Structure';
import StatusField from '../../../components/Status';
import Icon from '../../../components/Icon';
import Button from '../../../components/Button';
import Tag from '../../../components/Tag';
import { PopoverWrapper } from '../../../components/Popover';
import StickyHeader from './StickyHeader';

type Props = {
  label: string;
  resourceUrl: string;
  initialData: IRun[];
  queryParams: Record<string, string>;
  onOrderChange: (p: string) => void;
  handleGroupTitleClick: (title: string) => void;
  updateListValue: (key: string, value: string) => void;
  hideLoadMore?: boolean;
  targetCount: number;
};

const ResultGroup: React.FC<Props> = ({
  label,
  initialData: rows,
  queryParams,
  onOrderChange,
  handleGroupTitleClick,
  updateListValue,
  targetCount,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [isInViewport, targetRef] = useIsInViewport();

  const cols = [
    { label: t('fields.flow_id'), key: 'flow_id', hidden: queryParams._group === 'flow_id' },
    { label: t('fields.id'), key: 'run_number' },
    { label: t('fields.user'), key: 'user_name', hidden: queryParams._group === 'user_name' },
    { label: t('fields.started-at'), key: 'ts_epoch' },
    { label: t('fields.finished-at'), key: 'finished_at' },
    { label: t('fields.duration'), key: 'duration' },
    { label: t('fields.status'), key: 'status' },
    { label: t('fields.user-tags'), key: 'tags' },
  ].filter((item) => !item.hidden);

  const tableRef = useRef<HTMLTableElement>(null);

  const tableHeader = (
    <TableHeader
      handleClick={handleGroupTitleClick}
      error={null}
      cols={cols}
      onOrderChange={onOrderChange}
      order={queryParams['_order']}
      label={label}
      clickable={!!queryParams._group}
    />
  );

  return (
    <StyledResultGroup ref={targetRef}>
      <Table cellPadding="0" cellSpacing="0" ref={tableRef} style={{ position: 'relative', zIndex: 1 }}>
        {isInViewport && rows.length > 5 ? (
          <StickyHeader tableRef={tableRef}>{tableHeader}</StickyHeader>
        ) : (
          <thead>{tableHeader}</thead>
        )}
        <tbody>
          {rows.slice(0, targetCount).map((r, i) => {
            // Run is seen as stale if it doesnt match status filters anymore after its status changed
            const isStale = !!(queryParams.status && queryParams.status.indexOf(r.status) === -1);

            return (
              <TR
                key={`r-${i}`}
                clickable
                stale={isStale}
                onClick={() => history.push(getPath.run(r.flow_id, r.run_number))}
              >
                <TableRows r={r} params={queryParams} historyPush={history.push} updateListValue={updateListValue} />
              </TR>
            );
          })}
        </tbody>
      </Table>

      {targetCount < rows.length && (
        <div style={{ position: 'relative' }}>
          <Button
            className="load-more"
            onClick={() => handleGroupTitleClick(label)}
            size="sm"
            variant="primaryText"
            textOnly
          >
            {t('home.show-all-runs')} <Icon name="arrowDown" rotate={-90} padLeft />
          </Button>
        </div>
      )}
    </StyledResultGroup>
  );
};

//
// Table row
//

type TableRowsProps = {
  r: IRun;
  params: Record<string, string>;
  historyPush: (url: string) => void;
  updateListValue: (key: string, value: string) => void;
};

const TableRows: React.FC<TableRowsProps> = React.memo(
  ({ r, params, updateListValue }) => {
    return (
      <>
        {/* STATUS INDICATOR */}
        <StatusColorCell status={r.status} />
        {/* FLOW ID */}
        {params._group !== 'flow_id' && <TD>{r.flow_id}</TD>}
        {/* ID */}
        <TD>
          <IDFieldContainer>{r.run_number}</IDFieldContainer>
        </TD>
        {/* USER NAME */}
        {params._group !== 'user_name' && <TD>{r.user_name}</TD>}
        {/* STARTED AT */}
        <TD>{getISOString(new Date(r.ts_epoch))}</TD>
        {/* FINISHED AT */}
        <TD>{!!r.finished_at ? getISOString(new Date(r.finished_at)) : false}</TD>
        {/* DURATION */}
        <TD>{r.duration ? formatDuration(r.duration, 0) : ''}</TD>
        {/* STATUS */}
        <TD>
          <ForceNoBreakText>
            <StatusField status={r.status} />
          </ForceNoBreakText>
        </TD>
        {/* USER TAGS */}
        <RunTags tags={r.tags || []} updateListValue={updateListValue} />
      </>
    );
  },
  (prev, next) => {
    return prev.r == next.r; // eslint-disable-line
  },
);

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

//
// Table header
//

type HeaderColumnProps = {
  label: string;
  queryKey: string;
  onSort: (p: string) => void;
  currentOrder: string;
};

const HeaderColumn = (props: HeaderColumnProps) => <HeaderColumnBase {...props} />;

type TableHeaderProps = {
  handleClick: (str: string) => void;
  error: Error | null;
  cols: { label: string; key: string; hidden?: boolean }[];
  onOrderChange: (p: string) => void;
  order: string;
  label: string;
  clickable: boolean;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  handleClick,
  error,
  cols,
  onOrderChange,
  order,
  label,
  clickable,
}) => (
  <>
    <TR>
      <th colSpan={cols.length + 2} style={{ textAlign: 'left' }}>
        <ResultGroupTitle onClick={() => (clickable ? handleClick(label) : null)} clickable={clickable}>
          {label}
        </ResultGroupTitle>
        {error && <Label type={LabelType.Warning}>{error.message}</Label>}
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

export default ResultGroup;

export const StyledResultGroup = styled(Section)`
  margin-bottom: ${(p) => p.theme.spacer.md}rem;

  table {
    margin-bottom: ${(p) => p.theme.spacer.sm}rem;
    word-break: break-all;
  }

  thead {
    background: ${(p) => p.theme.color.bg.white};
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

const ResultGroupTitle = styled.h3<{ clickable: boolean }>`
  margin-top: 1rem;
  cursor: ${(p) => (p.clickable ? 'pointer' : 'normal')};
  display: inline-block;

  &:hover {
    ${(p) => (p.clickable ? `color: ${p.theme.color.text.blue};` : '')}
  }
`;

const IDFieldContainer = styled.div`
  min-height: 24px;
  display: flex;
  align-items: center;
`;

type RunTagsProps = {
  tags: string[];
  updateListValue: (key: string, value: string) => void;
};

const RunTags: React.FC<RunTagsProps> = ({ tags, updateListValue }) => {
  const [open, setOpen] = useState(false);
  if (!tags || tags.length === 0) return <TD />;
  return (
    <TagsCell
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {tags.join(', ')}
      {open && (
        <TagPopOverContainer>
          <TagsPopover show>
            {tags.map((tag) => (
              <Tag
                key={tag}
                highlighted
                onClick={() => {
                  updateListValue('_tags', tag);
                }}
              >
                {tag}
              </Tag>
            ))}
          </TagsPopover>
          <ClickOverlay />
        </TagPopOverContainer>
      )}
    </TagsCell>
  );
};

const TagsCell = styled(TD)`
  color: ${(p) => p.theme.color.text.blue};
`;

const TagPopOverContainer = styled.div`
  position: relative;
`;

const TagsPopover = styled(PopoverWrapper)`
  top: 100%;
  width: 200px;
  display: flex;
  flex-wrap: wrap;

  ${Tag} {
    margin-bottom: 0.25rem;
    margin-right: 0.25rem;
  }
`;

const ClickOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
`;
