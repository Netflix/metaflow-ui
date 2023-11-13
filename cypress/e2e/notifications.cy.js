import NotificationsResponse from '../fixtures/notifications_response';

describe("Notifications", () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('With empty response', () => {
    cy.get('[data-testid="helpmenu-toggle"]')
      .click()
      .then(() => {
        // test that empty notifications are handled correctly
        cy.intercept({ method: 'get', url: '**/notifications' }, (req) => {
          req.reply({
            statusCode: 200,
            body: [],
          });
        }).as('NotificationsMockDataEmpty');
        cy.get('[data-testid="helpmenu-link-notifications"]').first().click();
        cy.wait('@NotificationsMockDataEmpty');
        cy.get('[data-testid="generic-error"]').contains('No results found');
      });
  });
  
  it('With notifications', () => {
    cy.get('[data-testid="helpmenu-toggle"]')
      .click()
      .then(() => {
        // test that notifications are handled correctly
        cy.intercept({ method: 'get', url: '**/notifications' }, (req) => {
          req.reply({
            statusCode: 200,
            body: NotificationsResponse,
          });
        }).as('NotificationsMockData');
        cy.get('[data-testid="helpmenu-link-notifications"]').first().click();
        cy.wait('@NotificationsMockData');
        cy.get('[data-testid="notification-result"]').should('have.length', 3);
      });
  });
  
})

