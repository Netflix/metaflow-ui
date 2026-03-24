import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import DarkModeToggle from '..';

describe('DarkModeToggle component test', () => {
  it('should toggle theme on click', () => {
    cy.viewport(400, 400);

    mount(
      <TestWrapper>
        <DarkModeToggle />
      </TestWrapper>,
    );

    cy.get('[data-testid="dark-mode-toggle"]')
      .should('have.attr', 'aria-label')
      .then((ariaLabel: any) => {
        const ariaLabelStr = String(ariaLabel);
        const isInitialDark = ariaLabelStr === 'Switch to light mode';
        
        cy.get('[data-testid="dark-mode-toggle"]').click();

        const expectedLabel = isInitialDark ? 'Switch to dark mode' : 'Switch to light mode';
        cy.get('[data-testid="dark-mode-toggle"]')
          .should('have.attr', 'aria-label', expectedLabel);

        cy.get('[data-testid="dark-mode-toggle"]').click();
        cy.get('[data-testid="dark-mode-toggle"]')
          .should('have.attr', 'aria-label', ariaLabel);
      });
  });
});
