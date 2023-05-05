import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import theme from '../../../theme';
import { AutoCompleteItem } from '../../../hooks/useAutoComplete';
import AutoComplete from '..';

const resultsTestList = [
  { value: 'test_1', label: 'Test 1' },
  { value: 'test_2', label: 'Test 2' },
  { value: 'test_3', label: 'Test 3' },
];

describe('AutoComplete test', () => {
  it('AutoComplete basic', () => {
    cy.viewport(1000, 600);
    mount(
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <AutoComplete result={[] as AutoCompleteItem[]} setActiveOption={() => {}} onSelect={() => {}} />
          </QueryParamProvider>
        </Router>
      </ThemeProvider>,
    );

    cy.get('[data-testid="autocomplete-popup"]').children().should('have.length', 0);

    mount(
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <AutoComplete result={resultsTestList} setActiveOption={() => {}} onSelect={() => {}} />
          </QueryParamProvider>
        </Router>
      </ThemeProvider>,
    );

    cy.get('[data-testid="autocomplete-popup"]').children().should('have.length', 3);
  });
});
