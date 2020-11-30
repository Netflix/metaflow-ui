import React, { useState, useRef, useContext } from 'react';
import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun, RunStatus } from '../../../types';
import { getPath } from '../../../utils/routing';

import Table, { TR, TD, TH, HeaderColumn as HeaderColumnBase } from '../../../components/Table';
import { ForceNoBreakText } from '../../../components/Text';
import Label, { LabelType } from '../../../components/Label';
import { Section } from '../../../components/Structure';
import StatusField from '../../../components/Status';
import Icon from '../../../components/Icon';
import Button from '../../../components/Button';
import StickyHeader from './StickyHeader';
import { getRunDuration, getRunEndTime, getRunStartTime, getUsername } from '../../../utils/run';
import { TimezoneContext } from '../../../components/TimezoneProvider';

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
  const { timezone } = useContext(TimezoneContext);

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
        {isInViewport ? <StickyHeader tableRef={tableRef}>{tableHeader}</StickyHeader> : <thead>{tableHeader}</thead>}
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
                <TableRows
                  r={r}
                  params={queryParams}
                  historyPush={history.push}
                  updateListValue={updateListValue}
                  timezone={timezone}
                />
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
  timezone: string;
};

const TableRows: React.FC<TableRowsProps> = React.memo(({ r, params, updateListValue, timezone }) => {
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
      {params._group !== 'user_name' && <TD>{getUsername(r)}</TD>}
      {/* STARTED AT */}
      <TimeCell>{getRunStartTime(r, timezone)}</TimeCell>
      {/* FINISHED AT */}
      <TimeCell>{getRunEndTime(r, timezone)}</TimeCell>
      {/* DURATION */}
      <TimeCell>{getRunDuration(r)}</TimeCell>
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
});

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

const TimeCell = styled(TD)`
  word-break: break-word;
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
    <TR className="result-group-title">
      <th colSpan={cols.length + 2} style={{ textAlign: 'left' }}>
        <ResultGroupTitle onClick={() => (clickable ? handleClick(label) : null)} clickable={clickable}>
          {label}
        </ResultGroupTitle>
        {error && <Label type={LabelType.Warning}>{error.message}</Label>}
      </th>
    </TR>
    <TR className="result-group-columns">
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

  thead,
  th {
    background: ${(p) => p.theme.color.bg.white};
    z-index: 10;
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

  return (
    <TagsCell
      width="20%"
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        // setOpen(!open);
      }}
      onMouseOver={() => setOpen(true)}
    >
      <TagContainer>
        {tags.slice(0, 3).map((tag, index) => (
          <span key={tag} onClick={() => updateListValue('_tags', tag)}>
            {tag}
            {index !== tags.length - 1 && ', '}
          </span>
        ))}

        {tags.length > 3 && !open && <span>...</span>}
      </TagContainer>

      {tags.length > 3 && (
        <AllTagsContainer open={open}>
          {(open ? tags : tags.slice(0, 3)).map((tag, index) => (
            <span key={tag} onClick={() => updateListValue('_tags', tag)}>
              {tag}
              {index !== tags.length - 1 && ', '}
            </span>
          ))}
        </AllTagsContainer>
      )}
    </TagsCell>
  );
};

const TagsCell = styled(TD)`
  color: ${(p) => p.theme.color.text.blue};
  position: relative;
  line-height: 1.25rem;

  span:hover {
    text-decoration: underline;
  }
`;

const TagContainer = styled.div`
  position: relative;
`;

const AllTagsContainer = styled.div<{ open: boolean }>`
  position: absolute;
  top: 0;
  background: #e4f0ff;
  z-index: 1;
  width: 100%;
  left: 0;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  transition: 0.15s all;
  overflow: hidden;

  opacity: ${(p) => (p.open ? '1' : '0')};
`;
