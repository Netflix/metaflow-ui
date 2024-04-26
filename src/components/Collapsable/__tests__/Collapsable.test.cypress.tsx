import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import theme from '../../../theme';
import Collapsable from '..';

describe('Collapsable test', () => {
  it('Collapsable basic', () => {
    cy.viewport(1000, 600);
    mount(
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Collapsable title="Test child div">
              <div>test_child_div</div>
            </Collapsable>
          </QueryParamProvider>
        </Router>
      </ThemeProvider>,
    );

    // check that the component renders correctly in default closed state
    cy.get('[data-testid="collapsable-header"]').find('.icon-arrowDown').invoke('attr', 'rotate').should('eq', '-90');
    cy.get('[data-testid="collapsable-content"]').not('visbile');

    // check that the component renders correctly when opened
    cy.get('[data-testid="collapsable-header"]')
      .click()
      .then(() => {
        cy.get('[data-testid="collapsable-header"]').find('.icon-arrowDown').invoke('attr', 'rotate').should('eq', '0');
        cy.get('[data-testid="collapsable-content"]').should('be.visible');
      });

    // check that the component renders correctly when closed
    cy.get('[data-testid="collapsable-header"]')
      .click()
      .then(() => {
        cy.get('[data-testid="collapsable-header"]')
          .find('.icon-arrowDown')
          .invoke('attr', 'rotate')
          .should('eq', '-90');
        cy.get('[data-testid="collapsable-content"]').not('visible');
      });
  });
});
