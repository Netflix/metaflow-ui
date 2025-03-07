import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import DateInput from '../DateInput';

describe('DateInput', () => {
  it('DateInput - Input type date', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <DateInput onSubmit={fn} onChange={fn} label="testdate" initialValue="2010-06-01" />
      </TestWrapper>,
    );

    cy.get('input').should('have.value', '2010-06-01');

    cy.get('input')
      .type('2021-07-02')
      .then(() => {
        expect(fn).to.have.been.calledOnceWith('2021-07-02');
      });

    cy.get('input').should('have.value', '2021-07-02');
  });

  it('DateInput - Input type datetime-local', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <DateInput
          onSubmit={fn}
          onChange={fn}
          label="testdate"
          initialValue="2010-06-01T12:00"
          inputType="datetime-local"
        />
      </TestWrapper>,
    );

    cy.get('input').should('have.value', '2010-06-01T12:00');

    cy.get('input')
      .type('2021-07-02T13:00')
      .then(() => {
        expect(fn).to.have.been.calledOnceWith('2021-07-02T13:00');
      });

    cy.get('input').should('have.value', '2021-07-02T13:00');
  });
});
