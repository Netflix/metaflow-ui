import React from 'react';
import { mount } from '@cypress/react';
import AppBar from '..';
import { PluginsProvider } from '../../Plugins/PluginManager';
import TestWrapper from '../../../utils/testing';

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
