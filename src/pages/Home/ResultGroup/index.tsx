import React, { useRef, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useIsInViewport from 'use-is-in-viewport';

import { Run as IRun } from '@/types';

import Table from '@components/Table';
import { Section } from '@components/Structure';
import { TimezoneContext } from '@components/TimezoneProvider';

import StickyHeader from '@pages/Home/ResultGroup/StickyHeader';
import ResultGroupHeader from '@pages/Home/ResultGroup/ResultGroupHeader';
import ResultGroupFooter from '@pages/Home/ResultGroup/ResultGroupFooter';
import ResultGroupRow from '@pages/Home/ResultGroup/ResultGroupRow';

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
      {
        label: t('fields.status'),
        key: 'status',
        maxWidth: '62',
      },
      {
        label: t('fields.flow_id'),
        key: 'flow_id',
        sortable: true,
        hidden: queryParams._group === 'flow_id',
        maxWidth: '20%',
      },
      {
        label: t('fields.project'),
        key: 'project',
        sortable: true,
        hidden: queryParams._group !== 'flow_id',
        maxWidth: '12.5%',
      },
      { label: t('fields.id'), key: 'run', maxWidth: '15%' },
      {
        label: t('fields.user'),
        sortable: true,
        key: 'user',
        hidden: queryParams._group === 'user',
        maxWidth: '12.5%',
      },
      { label: t('fields.started-at'), sortable: true, key: 'ts_epoch' },
      { label: t('fields.finished-at'), sortable: true, key: 'finished_at' },
      { label: t('fields.duration'), sortable: true, key: 'duration' },
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
      <StyledResultGroup ref={targetRef} data-testid="result-group">
        <Table cellPadding="0" cellSpacing="0" ref={tableRef} style={{ position: 'relative', zIndex: 1 }}>
          {isInViewport ? <StickyHeader tableRef={tableRef}>{tableHeader}</StickyHeader> : <thead>{tableHeader}</thead>}
          <tbody>
            {rowsToRender.map((r) => {
              // Run is seen as stale if it doesnt match status filters anymore after its status changed
              const isStale = !!(queryParams.status && queryParams.status.indexOf(r.status) === -1);
              return (
                <ResultGroupRow
                  key={r.flow_id + r.run_number}
                  run={r}
                  isStale={isStale}
                  queryParams={queryParams}
                  updateListValue={updateListValue}
                  timezone={timezone}
                  cols={cols}
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
// Styles
//

export const StyledResultGroup = styled(Section)`
  margin-bottom: var(--spacing-7);

  table {
    margin-bottom: var(--spacing-3);
    word-break: break-all;
  }

  thead {
    border-top-left-radius: var(--table-border-radius);
    border-top-right-radius: var(--table-border-radius);
  }

  th {
    background: var(--table-head-bg);
    z-index: 10;
  }
`;

export default ResultGroup;
