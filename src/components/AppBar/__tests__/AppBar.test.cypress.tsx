import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import AppBar from '..';
import { PluginsProvider } from '../../Plugins/PluginManager';

describe('AppBar test', () => {
  it('AppBar basic', () => {
    cy.viewport(1000, 600);
    mount(
      <PluginsProvider>
        <TestWrapper>
          <AppBar />
        </TestWrapper>
      </PluginsProvider>,
    );
    // test all of the AppBars child components render
    cy.get('[data-testid="page-logo-image"]').should('exist');
    cy.get('[data-testid="home-button"]').should('exist');
    cy.get('[data-testid="breadcrumb-goto-input-inactive"]').should('exist');
    cy.get('[data-testid="helpmenu-toggle"]').should('exist');
  });
});
