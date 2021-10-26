import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
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
  }
];

describe('DataHeader test', () => {
  it('DataHeader basic', () => {
    cy.viewport(1000, 600);
    mount(
      <ThemeProvider theme={theme}>
        <DataHeader items={itemsList} wide={false} />
      </ThemeProvider>
    );
    cy.get('[data-testid="data-header-container"]').should('not.have.css','width','984px');

    mount(
      <ThemeProvider theme={theme}>
        <DataHeader items={itemsList} wide={true} />
      </ThemeProvider>
    );
    cy.get('[data-testid="data-header-container"]').should('have.css','width','984px');
  });
});