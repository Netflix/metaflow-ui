import React from 'react';
import styled from 'styled-components';

interface TableColumnDef<T> {
  key: keyof T;
  label: string;
  // Optional custom renderer for cell
  renderer?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumnDef<T>[];
  data: T[];
  noHeader?: boolean;
}

//
// Draft component for table elements. We might wanna use some library for this though like reac-table
//

function Table<T>({ columns, data, noHeader }: TableProps<T>): JSX.Element {
  return (
    <div className="table">
      <StyledTable>
        {!noHeader && (
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label}>{c.label}</th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {data.map((d, index) => (
            <Row key={index}>
              {columns.map((c, tdindex) => (
                <Cell key={`${index}-${tdindex}`}>{c.renderer ? c.renderer(d) : d[c.key]}</Cell>
              ))}
            </Row>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
}

const StyledTable = styled.table`
  width: 100%;
  border-spacing: unset;
`;

const Row = styled.tr`
  background: #f9f9fa;
`;

const Cell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #fff;
`;

export default Table;
