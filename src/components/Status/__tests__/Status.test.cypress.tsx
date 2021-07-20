import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Status from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Status status="Test" />
      </ThemeProvider>
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'background-color', 'rgb(118, 118, 118)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="completed" />
      </ThemeProvider>
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'background-color', 'rgb(32, 175, 46)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="failed" />
      </ThemeProvider>
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'background-color', 'rgb(235, 52, 40)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="running" />
      </ThemeProvider>
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'background-color', 'rgb(229, 169, 12)');
  });
});