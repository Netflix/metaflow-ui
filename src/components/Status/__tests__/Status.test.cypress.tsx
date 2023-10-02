import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Status from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Status status="completed" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(76, 152, 120)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="failed" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(255, 255, 255)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="running" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(188, 227, 7)');

    mount(
      <ThemeProvider theme={theme}>
        <Status status="pending" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(219, 173, 52)');
  });
});
