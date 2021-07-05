beforeEach(() => {
  cy.visit('/');
  // navigate to Debug -view
  cy.get('[data-testid="helpmenu-toggle"]')
    .click()
    .then(() => {
      cy.get('[data-testid="helpmenu-link-debug"]').first().click();
    });
});

it('Debug - Test that feature flags are rendered', () => {
  cy.get('[data-testid="debug_column"]')
    .eq(0)
    .then(($column) => {
      // check that first column is for Feature flags
      cy.wrap($column).find('[data-testid="debug_content_header"]').contains('Feature flags');
      // check that the column is not empty
      cy.wrap($column).find('div').eq(1).children().should('have.length.above', 0);
      // check that the first flag renders correctly
      cy.wrap($column).find('div').eq(1).children().eq(0).contains('DAG');
      cy.wrap($column).find('div').eq(1).children().eq(0).children().should('have.length', 2);
    });
});

it('Debug - Test network logging and discard logs', () => {
  cy.get('[data-testid="debug_column"]')
    .eq(1)
    .then(($column) => {
      // check that correct sections are found within the second column
      cy.wrap($column).find('[data-testid="debug_content_header"]').eq(0).contains('Google analytics tracking ID');
      cy.wrap($column).find('[data-testid="debug_content_header"]').eq(1).contains('Log recording');
      // find the start recording button
      cy.wrap($column)
        .find('[data-testid="debug_content_header"]')
        .eq(1)
        .siblings()
        .find('button')
        .should('have.text', 'Start recording')
        .then(($button) => {
          cy.wrap($button).click();
          cy.wrap($button).should('not.exist');
        });
      // find the recorded and end recording with discarding the logs
      cy.get('[data-testid="logger_container"]')
        .should('exist')
        .then(($logger) => {
          cy.wrap($logger).find('button').eq(1).click();
        });
    });
});

it('Debug - Test network logging and download logs', () => {
  cy.get('[data-testid="debug_column"]')
    .eq(1)
    .then(($column) => {
      // check that correct sections are found within the second column
      cy.wrap($column).find('[data-testid="debug_content_header"]').eq(0).contains('Google analytics tracking ID');
      cy.wrap($column).find('[data-testid="debug_content_header"]').eq(1).contains('Log recording');
      // find the start recording button
      cy.wrap($column)
        .find('[data-testid="debug_content_header"]')
        .eq(1)
        .siblings()
        .find('button')
        .should('have.text', 'Start recording')
        .then(($button) => {
          cy.wrap($button).click();
          cy.wrap($button).should('not.exist');
        });
      // find the recorded and end recording with discarding the logs
      cy.get('[data-testid="logger_container"]')
        .should('exist')
        .then(($logger) => {
          cy.wrap($logger).find('button').eq(0).click();
        });
    });
});
