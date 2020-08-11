import React from 'react';
import PropertyTable, { PropertyTableColumns } from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';

type MyTestType = {
  a: number;
  b: string;
  c: 'Eka' | 'Toka';
};

describe('PropertyTable component', () => {
  test('<PropertyTable /> - health check', () => {
    render(
      <TestWrapper>
        <PropertyTable items={[]} columns={[]} />
      </TestWrapper>,
    );
  });

  test('<PropertyTable /> - Rendering checks', () => {
    const items: MyTestType[] = [
      { a: 1, b: 'Hello', c: 'Eka' },
      { a: 4, b: 'Yo', c: 'Toka' },
    ];

    const columns: PropertyTableColumns<MyTestType>[] = [
      { label: 'First col', prop: 'a' },
      { label: 'Second col', prop: 'b' },
      { label: 'Third col', accessor: (item) => (item.c === 'Eka' ? 'Yep' : 'Nop') },
    ];

    const { getAllByTestId } = render(
      <TestWrapper>
        <PropertyTable items={items} columns={columns} />
      </TestWrapper>,
    );

    // Check header labels
    const headers = getAllByTestId('property-table-header');
    expect(headers.length).toBe(3);
    for (let i = 0; i < 3; i++) {
      const th = headers[i];
      expect(th.textContent).toBe(columns[i].label);
    }

    // Check row values
    const rows = getAllByTestId('property-table-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toBe('1HelloYep');
    expect(rows[1].textContent).toBe('4YoNop');
  });
});
