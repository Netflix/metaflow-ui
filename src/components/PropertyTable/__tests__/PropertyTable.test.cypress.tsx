import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import PropertyTable, { PropertyTableColumns } from '..';

type MyTestType = {
  a: number;
  b: string;
  c: 'Eka' | 'Toka';
};

describe('PropertyTable test', () => {
  it('<PropertyTable /> - health check', () => {
    mount(
      <TestWrapper>
        <PropertyTable items={[]} columns={[]} data-testid="test-propertytable" />
      </TestWrapper>,
    );
    cy.get('[data-testid="test-propertytable"]').should('exist');
  });

  it('<PropertyTable /> - Rendering checks', () => {
    const items: MyTestType[] = [
      { a: 1, b: 'Hello', c: 'Eka' },
      { a: 4, b: 'Yo', c: 'Toka' },
    ];

    const columns: PropertyTableColumns<MyTestType>[] = [
      { label: 'First col', prop: 'a' },
      { label: 'Second col', prop: 'b' },
      { label: 'Third col', accessor: (item) => (item.c === 'Eka' ? 'Yep' : 'Nop') },
    ];

    mount(
      <TestWrapper>
        <PropertyTable items={items} columns={columns} data-testid="test-propertytable" />
      </TestWrapper>,
    );

    // Check header labels
    cy.get('[data-testid="property-table-header"]')
      .should('have.length', '3')
      .each((header, index) => {
        cy.wrap(header).contains(`${columns[index].label}`);
      });

    // Check row values
    cy.get('[data-testid="property-table-row"]')
      .should('have.length', '2')
      .each((row, index) => {
        cy.wrap(row).contains(`${items[index].a}${items[index].b}${items[index].c === 'Eka' ? 'Yep' : 'Nop'}`);
      });
  });
});
