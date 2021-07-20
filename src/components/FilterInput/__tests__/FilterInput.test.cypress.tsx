import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import FilterInput from '..';

describe('FilterInput test', () => {
  it('<FilterInput /> - IO events', () => {
    const onSubmit = cy.stub();

    mount(
      <ThemeProvider theme={theme}>
        <FilterInput onSubmit={onSubmit} sectionLabel="Hello" />
      </ThemeProvider>
    );

    const input = cy.get('[data-testid="filter-input-field"]');
    expect(input).to.exist;
    // Trigger with Enter
    input.type('testing')
      .should('have.value', 'testing')
      .type('{enter}')
      .then(() => {
        expect(onSubmit).to.have.been.calledWith('testing');
      });
    
    // Trigger with button click
    input.type('testing, click')
      .should('have.value', 'testing, click')
      .then(() => {
        cy.get('[data-testid="filter-input-submit-button"]').click()
          .then(() => {
            expect(onSubmit).to.have.been.calledWith('testing, click');
          })
      })
  });
});