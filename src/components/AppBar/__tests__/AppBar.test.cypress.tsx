import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import theme from '../../../theme';
import AppBar from '..';
import { PluginsProvider } from '../../Plugins/PluginManager';

describe('AppBar test', () => {
  it('AppBar basic', () => {
    cy.viewport(1000, 600);
    mount(
      <ThemeProvider theme={theme}>
        <PluginsProvider>
          <Router>
            <QueryParamProvider ReactRouterRoute={Route}>
              <AppBar />
            </QueryParamProvider>
          </Router>
        </PluginsProvider>
      </ThemeProvider>,
    );
    // test all of the AppBars child components render
    cy.get('[data-testid="page-logo-image"]').should('exist');
    cy.get('[data-testid="home-button"]').should('exist');
    cy.get('[data-testid="breadcrumb-button-container"]').should('exist');
    cy.get('[data-testid="helpmenu-toggle"]').should('exist');
  });
});
