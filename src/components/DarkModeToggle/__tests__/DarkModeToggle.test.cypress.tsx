import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import DarkModeToggle from '..';

describe('DarkModeToggle component test', () => {
  it('should toggle theme on click', () => {
    // Standard viewport for component testing
    cy.viewport(400, 400);

    mount(
      <TestWrapper>
        <DarkModeToggle />
      </TestWrapper>,
    );

    // 1. Check initial state (should default to light mode aria-label in test env)
    // Note: getInitialTheme in ThemeProvider checks matchMedia and localStorage.
    // In Cypress test environment, it likely defaults to 'light'.
    cy.get('[data-testid="dark-mode-toggle"]')
      .should('have.attr', 'aria-label')
      .then((ariaLabel: any) => {
        const ariaLabelStr = String(ariaLabel);
        const isInitialDark = ariaLabelStr === 'Switch to light mode';
        
        // 2. Click the toggle
        cy.get('[data-testid="dark-mode-toggle"]').click();

        // 3. Verify it changed to the opposite
        const expectedLabel = isInitialDark ? 'Switch to dark mode' : 'Switch to light mode';
        cy.get('[data-testid="dark-mode-toggle"]')
          .should('have.attr', 'aria-label', expectedLabel);

        // 4. Click again and verify it returns to initial
        cy.get('[data-testid="dark-mode-toggle"]').click();
        cy.get('[data-testid="dark-mode-toggle"]')
          .should('have.attr', 'aria-label', ariaLabel);
      });
  });
});
