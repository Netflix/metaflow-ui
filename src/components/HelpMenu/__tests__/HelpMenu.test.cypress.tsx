import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import theme from '../../../theme';
import HelpMenu from '..';

describe('HelpMenu test', () => {
  it('<HelpMenu />', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <HelpMenu />
          </QueryParamProvider>
        </Router>
      </ThemeProvider>,
    );

    // Should not be visible
    cy.get('[data-testid="helpmenu-popup"]').should('not.be', 'visible');

    // Open with button
    cy.get('[data-testid="helpmenu-toggle"]')
      .click()
      .then(() => {
        cy.get('[data-testid="helpmenu-popup"]').should('be.visible');
      });

    // These tests are bit iffy. These links might change
    cy.get('[data-testid="helpmenu-link"]').eq(0).should('have.attr', 'href', 'https://docs.metaflow.org/');
    cy.get('[data-testid="helpmenu-link"]').eq(0).contains('Documentation');

    // Close by clicking overlay
    // click needs to be forced cause the overlay is considered not visible
    cy.get('[data-testid="helpmenu-click-overlay"]')
      .click({ force: true })
      .then(() => {
        cy.get('[data-testid="helpmenu-popup"]').should('not.be', 'visible');
      });

    // Open with button
    cy.get('[data-testid="helpmenu-toggle"]')
      .click()
      .then(() => {
        cy.get('[data-testid="helpmenu-popup"]').should('be.visible');
      });

    // close by close button
    cy.get('[data-testid="helpmenu-close"]')
      .click()
      .then(() => {
        cy.get('[data-testid="helpmenu-popup"]').should('not.be', 'visible');
      });
  });
});
