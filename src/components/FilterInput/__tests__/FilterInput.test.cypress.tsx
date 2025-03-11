import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import FilterInput from '..';

describe('FilterInput test', () => {
  it('<FilterInput /> - IO events', () => {
    const onSubmit = cy.stub();

    mount(
      <TestWrapper>
        <FilterInput onSubmit={onSubmit} sectionLabel="Hello" />
      </TestWrapper>,
    );

    const input = cy.get('[data-testid="filter-input-field"]');
    expect(input).to.exist;
    // Trigger with Enter
    input
      .type('testing')
      .should('have.value', 'testing')
      .type('{enter}')
      .then(() => {
        expect(onSubmit).to.have.been.calledWith('testing');
      });

    // Trigger with button click
    input
      .type('testing, click')
      .should('have.value', 'testing, click')
      .then(() => {
        cy.get('[data-testid="filter-input-submit-button"]')
          .click()
          .then(() => {
            expect(onSubmit).to.have.been.calledWith('testing, click');
          });
      });
  });
});
