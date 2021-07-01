import DAGResponse from '../fixtures/dag_response';

beforeEach(() => {
  cy.visit('/');
  // Should have general title "Runs"
  cy.get('.result-group-title').contains('Runs');
  // Should have only one result group
  cy.get('[data-testid="result-group"]').should('have.length', 1);
});

it('Run details - Navigate to Run Details/DAG with an error response', () => {
  // set intercept for /dag GET and insert mock response for error
  cy.intercept({ method: 'GET', url: '**/dag*' }, (req) => {
    req.reply({
      statusCode: 400,
      body: {},
    });
  }).as('DAGMockDataError');
  // click on the first run item on the list
  cy.get('[data-testid="result-group-row"]').first().click();
  cy.get('[data-testid="collapsable-header"]').contains('Details').click();
  cy.get('[data-testid="titled-row"]').should('have.length', 3);
  cy.get('[data-testid="collapsable-header"]').contains('Details').click();
  cy.get('[data-testid="tab-heading-item"]').first().contains('DAG').click();
  cy.wait('@DAGMockDataError');
  cy.get('[data-testid="collapsable-header"]').contains('Error details').click();
  cy.get('[data-testid="titled-row"]').should('have.length', 4);
  cy.get('[data-testid="collapsable-header"]').contains('Error details').click();
});

it('Run details - Navigate to Run Details/DAG with a succesful response', () => {
  // set intercept for /dag GET and insert mock response for success
  cy.intercept({ method: 'GET', url: '**/dag*' }, (req) => {
    req.reply({
      statusCode: 200,
      body: DAGResponse,
    });
  }).as('DAGMockData');
  cy.get('[data-testid="result-group-row"]').first().click();
  // navigate back to Timeline
  cy.get('[data-testid="tab-heading-item"]').eq(1).contains('Timeline').click();
  // navigate to DAG
  cy.get('[data-testid="tab-heading-item"]').first().contains('DAG').click();
  cy.wait('@DAGMockData');
  // check that dom has the correct amount of items
  cy.get('[data-testid="dag-parallel-container"]').should('have.length', 1);
  cy.get('[data-testid="dag-normalitem-box"]').should('have.length', 34);
  cy.get('[data-testid="dag-normalitem"]').first().scrollIntoView({ duration: 500 }).should('be.visible');
});

it('Run details - Test Timeline controls', () => {
  // click on the first run item on the list
  cy.get('[data-testid="result-group-row"]').first().click();
  // lets test that collapse button actually changes the amount of timeline items
  cy.get('[data-testid="tab-heading-item"]')
    .eq(1)
    .contains('Timeline')
    .click()
    .then(() => {
      cy.get('.ReactVirtualized__Grid__innerScrollContainer')
        .children()
        .its('length')
        .then((listLength1) => {
          cy.get('[data-testid="timeline-collapse-button"]')
            .click()
            .then(() => {
              cy.get('.ReactVirtualized__Grid__innerScrollContainer')
                .children()
                .its('length')
                .then((listLength2) => {
                  expect(listLength1).to.be.greaterThan(listLength2);
                });
            });
        });
    });
  // uncollapse timeline before moving forward
  cy.get('[data-testid="timeline-collapse-button"]').click();
  // lets test that Mode change actually changes the amount of timeline items
  cy.get('[data-testid="select-field"]')
    .contains('Mode')
    .parent()
    .click()
    .then(() => {
      cy.get('.ReactVirtualized__Grid__innerScrollContainer')
        .children()
        .its('length')
        .then((listLength1) => {
          cy.get('[data-testid="option-monitoring"]')
            .click()
            .then(() => {
              cy.get('.ReactVirtualized__Grid__innerScrollContainer')
                .children()
                .its('length')
                .then((listLength2) => {
                  expect(listLength1).to.be.greaterThan(listLength2);
                });
            });
        });
    });
  // reset timeline to Workflow mode
  cy.get('[data-testid="select-field"]')
    .contains('Mode')
    .parent()
    .click()
    .then(() => {
      cy.get('[data-testid="option-overview"]').click();
    });
});

it('Run details - Navigate back to Runs view with a system_tag filter', () => {
  // click on the first run item on the list
  cy.get('[data-testid="result-group-row"]').first().click().wait(500);
  // move to Task tab
  cy.get('[data-testid="tab-heading-item"]').eq(2).contains('Task').click();
  cy.get('#taskinfo [data-testid="collapsable-header"]').click();
  cy.get('[data-testid="titled-row"]').should('have.length', 6);
  cy.get('#taskinfo [data-testid="collapsable-header"]').click();

  // open details
  cy.get('[data-testid="collapsable-header"]').contains('Details').scrollIntoView({ duration: 500 }).click();
  cy.get('[data-testid="titled-row-title"]').eq(2).contains('System tags');
  // ensure that the run actually has some run parameters
  cy.get('[data-testid="titled-row-default-mode"]')
    .eq(2)
    .get('[data-testid="titled-row-default-mode"] div')
    .children()
    .should('have.length.above', 1);
  cy.get('[data-testid="titled-row-default-mode"]')
    .eq(2)
    .get('[data-testid="titled-row-default-mode"] div a')
    .eq(2)
    .then((element) => {
      // filter runs view with a system tag
      cy.get(element).click();
      // ensure that the selected tag from earlier exists
      cy.wait(500).get('.removable-tag').contains(element.text().replace(', ', ''));
      // remove the tag
      cy.get('.removable-tag').click();
    });
});
