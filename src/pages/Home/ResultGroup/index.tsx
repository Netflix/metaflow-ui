import React, { useRef, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun } from '../../../types';
import { getPath } from '../../../utils/routing';

import Table, { TR } from '../../../components/Table';
import { Section } from '../../../components/Structure';
import StickyHeader from './StickyHeader';
import { getRunId } from '../../../utils/run';
import { TimezoneContext } from '../../../components/TimezoneProvider';

import ResultGroupHeader from './ResultGroupHeader';
import ResultGroupRows from './ResultGroupRows';
import ResultGroupFooter from './ResultGroupFooter';

//
// Typedef
//

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
  grouping: boolean;
};

export type TableColDefinition = {
  label: string;
  key: string;
  hidden?: boolean;
  maxWidth?: string;
  sortable?: boolean;
};

//
// Component
//

const ResultGroup: React.FC<Props> = React.memo(
  ({
    label,
    initialData: rows,
    queryParams,
    onOrderChange,
    handleGroupTitleClick,
    updateListValue,
    targetCount,
    grouping,
  }) => {
    const { t } = useTranslation();
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
      <ResultGroupHeader
        handleClick={handleGroupTitleClick}
        error={null}
        cols={cols}
        onOrderChange={onOrderChange}
        order={queryParams['_order']}
        label={label === 'null' ? 'None' : label}
        clickable={!!queryParams._group}
      />
    );

    const rowsToRender = rows.slice(0, targetCount);

    return (
      <StyledResultGroup ref={targetRef}>
        <Table cellPadding="0" cellSpacing="0" ref={tableRef} style={{ position: 'relative', zIndex: 1 }}>
          {isInViewport ? <StickyHeader tableRef={tableRef}>{tableHeader}</StickyHeader> : <thead>{tableHeader}</thead>}
          <tbody>
            {rowsToRender.map((r, i) => {
              // Run is seen as stale if it doesnt match status filters anymore after its status changed
              const isStale = !!(queryParams.status && queryParams.status.indexOf(r.status) === -1);
              return (
                <Row
                  key={i}
                  run={r}
                  isStale={isStale}
                  queryParams={queryParams}
                  updateListValue={updateListValue}
                  timezone={timezone}
                />
              );
            })}
          </tbody>
        </Table>

        <ResultGroupFooter grouping={grouping} rows={rows.length} onOpenGroup={() => handleGroupTitleClick(label)} />
      </StyledResultGroup>
    );
  },
  (prevProps, newProps) => {
    return prevProps.queryParams._group !== newProps.queryParams._group;
  },
);

//
// Row component that will lock it's state when hovered
//
const Row: React.FC<{
  isStale: boolean;
  queryParams: Record<string, string>;
  updateListValue: (key: string, value: string) => void;
  run: IRun;
  timezone: string;
}> = ({ isStale, queryParams, updateListValue, run, timezone }) => {
  const [runToRender, setRunToRender] = useState(run);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) {
      setRunToRender(run);
    }
  }, [isHovering]); // eslint-disable-line

  useEffect(() => {
    if (!isHovering || run.run_number === runToRender.run_number) {
      setRunToRender(run);
    }
  }, [run]); // eslint-disable-line

  return (
    <StyledTR
      clickable
      stale={isStale}
      onMouseOver={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
    >
      <ResultGroupRows
        r={runToRender}
        params={queryParams}
        updateListValue={updateListValue}
        link={getPath.run(runToRender.flow_id, getRunId(runToRender))}
        timezone={timezone}
      />
    </StyledTR>
  );
};

//
// Styles
//

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

const StyledTR = styled(TR)`
  transition: transform 0.15s, filter 0.25s;
  &:hover {
    transform: scale(1.005);
    filter: drop-shadow(2px 1px 4px rgba(0, 0, 0, 0.2));
  }
`;

export default ResultGroup;
