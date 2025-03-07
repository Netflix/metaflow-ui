import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import Status from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <TestWrapper>
        <Status status="completed" />
      </TestWrapper>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(76, 152, 120)');

    mount(
      <TestWrapper>
        <Status status="failed" />
      </TestWrapper>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(255, 255, 255)');

    mount(
      <TestWrapper>
        <Status status="running" />
      </TestWrapper>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(188, 227, 7)');

    mount(
      <TestWrapper>
        <Status status="pending" />
      </TestWrapper>,
    );
    cy.get('[data-testid="status-container"]').should('exist');
    cy.get('[data-testid="status-container-color"]').should('have.css', 'color', 'rgb(219, 173, 52)');
  });
});
