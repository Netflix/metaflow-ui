import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import DataHeader from '..';

const itemsList = [
  {
    label: 'Test 1',
    value: 'test_1',
    hidden: false,
  },
  {
    label: 'Test 2',
    value: 'test_2',
    hidden: false,
  },
  {
    label: 'Test 3',
    value: 'test_3',
    hidden: false,
  },
];

describe('DataHeader test', () => {
  it('DataHeader basic', () => {
    cy.viewport(1000, 600);
    mount(
      <TestWrapper>
        <DataHeader items={itemsList} wide={false} />
      </TestWrapper>,
    );
    cy.get('[data-testid="data-header-element"]').eq(0).contains('Test 1');
    cy.get('[data-testid="data-header-element"]').eq(0).contains('test_1');
    cy.get('[data-testid="data-header-element"]').eq(1).contains('Test 2');
    cy.get('[data-testid="data-header-element"]').eq(1).contains('test_2');
    cy.get('[data-testid="data-header-element"]').eq(2).contains('Test 3');
    cy.get('[data-testid="data-header-element"]').eq(2).contains('test_3');
  });
});
