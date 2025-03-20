import React from 'react';
import styled from 'styled-components';
import Label, { LabelType } from '@components/Label';
import { HeaderColumn, TR } from '@components/Table';
import FEATURE_FLAGS from '@utils/FEATURE';
import { TableColDefinition } from '.';

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
      {!FEATURE_FLAGS.HIDE_TABLE_HEADER && label && (
        <TR className="result-group-title">
          <th colSpan={cols.length + 1} style={{ textAlign: 'left' }}>
            <ResultGroupTitle onClick={() => (clickable ? handleClick(label) : null)} clickable={clickable}>
              {label}
            </ResultGroupTitle>

            {error && <Label type={LabelType.Warning}>{error.message}</Label>}
          </th>
        </TR>
      )}
      <TR className="result-group-columns">
        {cols.map((col) => (
          <HeaderColumn
            key={col.key}
            label={col.label}
            queryKey={col.key}
            maxWidth={col.maxWidth}
            sortable={!!col.sortable}
            alignment={col.alignment}
            onSort={onOrderChange}
            currentOrder={order}
          />
        ))}
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
    ${(p) => (p.clickable ? `color: var(--color-text-highlight);` : '')}
  }
`;

export default ResultGroupHeader;
