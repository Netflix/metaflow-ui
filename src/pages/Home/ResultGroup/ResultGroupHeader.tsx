import React from 'react';
import styled from 'styled-components';
import { TableColDefinition } from '.';
import Label, { LabelType } from '../../../components/Label';
import { HeaderColumn, TR } from '../../../components/Table';
import { StatusColorHeaderCell } from './ResultGroupStatus';

type ResultGroupHeaderProps = {
  handleClick: (str: string) => void;
  error: Error | null;
  cols: TableColDefinition[];
  onOrderChange: (p: string) => void;
  order: string;
  label: string;
  clickable: boolean;
};

const ResultGroupHeader: React.FC<ResultGroupHeaderProps> = React.memo(
  ({ handleClick, error, cols, onOrderChange, order, label, clickable }) => (
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

        <th style={{ width: '2.5rem' }}></th>
      </TR>
    </>
  ),
  (previous, next) => {
    return previous.label === next.label && previous.order === next.order;
  },
);

const ResultGroupTitle = styled.h3<{ clickable: boolean }>`
  margin: 1rem 0;
  cursor: ${(p) => (p.clickable ? 'pointer' : 'normal')};
  display: inline-block;

  &:hover {
    ${(p) => (p.clickable ? `color: ${p.theme.color.text.blue};` : '')}
  }
`;

export default ResultGroupHeader;
