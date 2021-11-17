const MOCK_RUNS = [
  {
    flow_id: 'BasicFlow',
    run_number: 1,
    user_name: 'SanteriCM',
    user: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    status: 'completed',
    system_tags: ['user:SanteriCM'],
  },
  {
    flow_id: 'BasicFlow',
    run_number: 2,
    user_name: 'SanteriCM',
    user: 'SanteriCM',
    ts_epoch: 1595574763000,
    tags: ['testingtag'],
    status: 'completed',
    system_tags: ['user:SanteriCM'],
  },
  {
    flow_id: 'BasicFlow',
    run_number: 3,
    user_name: 'SanteriCM',
    user: 'SanteriCM',
    ts_epoch: 1595574764000,
    tags: ['testingtag'],
    status: 'completed',
    system_tags: ['user:SanteriCM'],
  }
]

describe("Home", () => {
  it('Home - Default settings', () => {
    cy.intercept({ method: 'GET', url: '**/runs*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_RUNS },
      });
    }).as('HomeData');

    cy.visit('/');
    cy.wait("@HomeData");
    // Should have general title "Runs"
    cy.get('.result-group-title').contains('Runs');
    // Should have only one result group
    cy.get('[data-testid="result-group"]').should('have.length', 1);
    // By default there should be 15 results
    cy.get('[data-testid="result-group-row"]').should('have.length', 3);
    // Should be ordered correctly by start time
    cy.get('td:nth-child(5)').should(($dateCells) => {
      // First row should have bigger date than second
      expect(new Date($dateCells.get(0).textContent) > new Date($dateCells.get(1).textContent)).to.be.true;
    });
    // test that changing timezone actually works and updates the start- and endtime values in the list
    cy.get('[data-testid="result-group-row"]')
      .first()
      .children()
      .eq(2)
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
  
})
