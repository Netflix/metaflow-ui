import DAGResponse from '../fixtures/dag_response';

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
];

const MOCK_STEPS = [
  {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'start',
    user_name: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', ],
  }
]

const MOCK_TASKS = [
  {
    flow_id: 'BasicFlow',
    run_number: 1,
    step_name: 'start',
    task_id: 1,
    task_name: '1',
    status: 'completed',
    user_name: 'SanteriCM',
    ts_epoch: 1595574762901,
    finished_at: 1595574762921,
    started_at: 1595574762901,
    duration: 20,
    attempt_id: 0,
    tags: ['testingtag'],
    system_tags: ['user:SanteriCM', 'runtime:dev', 'python_version:3.7.6', 'date:2020-07-24', 'metaflow_version:2.0.5'],
  }
]

describe('Rundetails', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept({ method: 'GET', url: '**/runs/*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_RUNS[0] },
      });
    });
    cy.intercept({ method: 'GET', url: '**/runs*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_RUNS },
      });
    }).as('HomeData');

    cy.intercept({ method: 'GET', url: '**/tasks*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_TASKS },
      });
    }).as("TaskData");
    cy.intercept({ method: 'GET', url: '**/attempts*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_TASKS },
      });
    }).as("AttemptData");
    
    cy.intercept({ method: 'GET', url: '**/steps*' }, (req) => {
      req.reply({
        statusCode: 200,
        body: { data: MOCK_STEPS },
      });
    }).as("StepData");
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
    cy.get('[data-testid="collapsable-header"]').contains('Details');
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
    cy.wait("@TaskData")
    cy.wait("@StepData")

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
});
