import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import Announcements from '..';
import NotificationsResponse from '../../../../cypress/fixtures/notifications_response.json';

describe('Announcements test', () => {
  it('Announcements basic', () => {
    cy.viewport(1000, 600);
    // mock notifications fetching
    cy.intercept({ method: 'get', url: '**/notifications**' }, (req) => {
      req.reply({
        statusCode: 200,
        body: NotificationsResponse,
      });
    }).as('NotificationsMockData');

    mount(
      <TestWrapper>
        <Announcements />
      </TestWrapper>,
    );

    // test that the notifications are rendered correctly
    cy.get('[data-testid="announcements-container"]').children().should('have.length', 3);

    // test that notifications can be removed
    cy.get('[data-testid="announcements-container"]')
      .children()
      .eq(2)
      .then(($elem) => cy.wrap($elem).find('.icon.icon-times').click());
    cy.get('[data-testid="announcements-container"]').children().should('have.length', 2);
  });
});
