import React, { useState, useRef, useContext, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
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
import { getRunDuration, getRunEndTime, getRunId, getRunStartTime, getUsername } from '../../../utils/run';
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

const ResultGroup: React.FC<Props> = React.memo(
  ({ label, initialData: rows, queryParams, onOrderChange, handleGroupTitleClick, updateListValue, targetCount }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const [isInViewport, targetRef] = useIsInViewport();
    const { timezone } = useContext(TimezoneContext);

    const cols: TableColDefinition[] = [
      { label: t('fields.flow_id'), key: 'flow_id', sortable: true, hidden: queryParams._group === 'flow_id' },
      { label: t('fields.id'), key: 'run' },
      { label: t('fields.user'), sortable: true, key: 'user', hidden: queryParams._group === 'user' },
      { label: t('fields.started-at'), sortable: true, key: 'ts_epoch', maxWidth: '170' },
      { label: t('fields.finished-at'), sortable: true, key: 'finished_at', maxWidth: '170' },
      { label: t('fields.duration'), key: 'duration', maxWidth: '100' },
      { label: t('fields.status'), key: 'status', maxWidth: '120' },
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
        label={label === 'null' ? 'None' : label}
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
                <TR key={`r-${i}`} clickable stale={isStale}>
                  <TableRows
                    r={r}
                    params={queryParams}
                    historyPush={history.push}
                    updateListValue={updateListValue}
                    link={getPath.run(r.flow_id, getRunId(r))}
                    timezone={timezone}
                  />
                </TR>
              );
            })}
          </tbody>
        </Table>

        {targetCount < rows.length && queryParams._group && (
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
  },
  (prevProps, newProps) => {
    return prevProps.queryParams._group !== newProps.queryParams._group;
  },
);

//
// Table row
//

type TableRowsProps = {
  r: IRun;
  params: Record<string, string>;
  historyPush: (url: string) => void;
  link: string;
  updateListValue: (key: string, value: string) => void;
  timezone: string;
};

const TableRows: React.FC<TableRowsProps> = ({ r, params, updateListValue, link, timezone }) => {
  return (
    <>
      {/* STATUS INDICATOR */}
      <StatusColorCell status={r.status} />
      {/* FLOW ID */}
      {params._group !== 'flow_id' && <TDWithLink link={link}>{r.flow_id}</TDWithLink>}
      {/* ID */}
      <TDWithLink link={link}>
        <IDFieldContainer>{getRunId(r)}</IDFieldContainer>
      </TDWithLink>
      {/* USER NAME */}
      {params._group !== 'user' && <TDWithLink link={link}>{getUsername(r)}</TDWithLink>}
      {/* STARTED AT */}
      <TimeCell link={link}>{getRunStartTime(r, timezone)}</TimeCell>
      {/* FINISHED AT */}
      <TimeCell link={link}>{getRunEndTime(r, timezone)}</TimeCell>
      {/* DURATION */}
      <TimeCell link={link}>
        <RunDuration run={r} />
      </TimeCell>
      {/* STATUS */}
      <TDWithLink link={link}>
        <ForceNoBreakText>
          <StatusField status={r.status} />
        </ForceNoBreakText>
      </TDWithLink>
      {/* USER TAGS */}
      {(r.tags || []).length > 0 ? (
        <RunTags tags={r.tags || []} updateListValue={updateListValue} />
      ) : (
        <TDWithLink link={link}></TDWithLink>
      )}
    </>
  );
};

const RunDuration: React.FC<{ run: IRun }> = ({ run }) => {
  const rerender = useState(0);
  // If run is in running state, we want to force update every second for duration rendering
  useEffect(() => {
    let t = 0;
    if (run.status === 'running') {
      t = setInterval(() => {
        rerender[1]((tick) => tick + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [run.status]); // eslint-disable-line

  return <>{getRunDuration(run)}</>;
};

const LinkTD = styled(TD)`
  position: relative;
`;

const GhostLink = styled(Link)`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

const TDWithLink: React.FC<{ link: string }> = ({ children, link }) => {
  return (
    <LinkTD>
      {children}
      <GhostLink to={link}></GhostLink>
    </LinkTD>
  );
};

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

const TimeCell = styled(TDWithLink)`
  word-break: break-word;
`;

//
// Table header
//

type HeaderColumnProps = {
  label: string;
  queryKey: string;
  sortable: boolean;
  onSort: (p: string) => void;
  currentOrder: string;
  maxWidth?: string;
};

const HeaderColumn = (props: HeaderColumnProps) => <HeaderColumnBase {...props} />;

export type TableColDefinition = {
  label: string;
  key: string;
  hidden?: boolean;
  maxWidth?: string;
  sortable?: boolean;
};

type TableHeaderProps = {
  handleClick: (str: string) => void;
  error: Error | null;
  cols: TableColDefinition[];
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
        <HeaderColumn
          key={col.key}
          label={col.label}
          queryKey={col.key}
          maxWidth={col.maxWidth}
          sortable={!!col.sortable}
          onSort={onOrderChange}
          currentOrder={order}
        />
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
  color: ${(p) => p.theme.color.text.dark};
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
  border-bottom: ${(p) => p.theme.border.thinNormal};
  transition: 0.15s all;
  overflow: hidden;

  opacity: ${(p) => (p.open ? '1' : '0')};
`;
