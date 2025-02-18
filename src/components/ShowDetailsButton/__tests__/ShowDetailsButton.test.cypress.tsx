import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import ShowDetailsButton from '..';

describe('ShowDetailsButton test', () => {
  it('ShowDetailsButton health check', () => {
    const toggle = cy.stub();
    mount(
      <TestWrapper>
        <ShowDetailsButton
          toggle={toggle}
          visible={false}
          showText="Yep"
          hideText="Nop"
          data-testid="test-showDetailsButton"
        />
      </TestWrapper>,
    );
    cy.get('[data-testid="test-showDetailsButton"]').should('have.text', 'Yep');

    mount(
      <TestWrapper>
        <ShowDetailsButton
          toggle={toggle}
          visible={true}
          showText="Yep"
          hideText="Nop"
          data-testid="test-showDetailsButton"
        />
      </TestWrapper>,
    );
    cy.get('[data-testid="test-showDetailsButton"]').should('have.text', 'Nop');
  });
});
