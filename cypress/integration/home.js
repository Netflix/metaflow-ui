it('Home - Default settings', () => {
  cy.visit('');
  // Should have general title "Runs"
  cy.get('.result-group-title').contains('Runs');
  // Should have only one result group
  cy.get('[data-testid="result-group"]').should('have.length', 1);
  // By default there should be 15 results
  cy.get('[data-testid="result-group-row"]').should('have.length', 15);
  // Should be ordered correctly by start time
  cy.get('td:nth-child(5)').should(($dateCells) => {
    // First row should have bigger date than second
    expect(new Date($dateCells.get(0).textContent) > new Date($dateCells.get(1).textContent)).to.be.true;
  });
  // open Group by
  cy.get('.sidebar [data-testid="select-field"]').click();
  // should contain Group by flow
  cy.get('[data-testid="option-flow_id"]').contains('Group by flow').click();
  // Runs header should not exist any more
  cy.get('.result-group-title').should('not.contain', 'Runs');
  // open Group by
  cy.get('.sidebar [data-testid="select-field"]').click();
  // should contain Group by user
  cy.get('[data-testid="option-user"]').contains('Group by user').click();
  // filter the list to show all runs by single user
  cy.get('.button.load-more').contains('Show all runs').click();
  // user filter should have a tag element added
  cy.get('[data-testid="filter-input-user"]').children().should('have.length', 2);
  // remove the filter tag
  cy.get('[data-testid="filter-input-user"]').children().eq(1).click();
  // open Group by
  cy.get('.sidebar [data-testid="select-field"]').click();
  // reset grouping
  cy.get('[data-testid="option-"]').contains('No grouping').click();
  // Should have only one result group
  cy.get('.result-group-title').contains('Runs');

  // test that changing timezone actually works and updates the start- and endtime values in the list
  cy.get('[data-testid="result-group-row"]')
    .first()
    .children()
    .eq(5)
    .invoke('text')
    .then((text1) => {
      cy.get('[data-testid="helpmenu-toggle"]').click();
      cy.get('[data-testid="helpmenu-popup"] [data-testid="select-field"]').click();
      cy.get('[data-testid="helpmenu-popup"] [data-testid="filter-input-field"]').type('helsinki');
      cy.get('[data-testid="helpmenu-popup"] label').contains('Timezones').next().click();
      cy.get('[data-testid="helpmenu-popup"] [data-testid="select-field"] .dropdown-button')
        .children()
        .should('contain.text', 'Europe/Helsinki');
      cy.get('[data-testid="helpmenu-close"]').click();

      cy.get('[data-testid="result-group-row"]')
        .first()
        .children()
        .eq(5)
        .invoke('text')
        .should((text2) => {
          expect(text1).not.to.eq(text2);
        });
    });
});

// TODO: Add tests for different URL parameters
