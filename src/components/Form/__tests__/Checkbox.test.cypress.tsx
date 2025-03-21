import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper, { gid } from '@utils/testing';
import { CheckboxField } from '../Checkbox';

describe('Checkbox', () => {
  it('Checkbox', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <CheckboxField data-testid="point" label="testbox" checked={false} onChange={fn} />
      </TestWrapper>,
    );

    cy.get('svg').should('not.exist');

    gid('point')
      .click()
      .then(() => {
        expect(fn).to.have.been.called;
      });

    mount(
      <TestWrapper>
        <CheckboxField data-testid="point" label="testbox" checked={true} onChange={fn} />
      </TestWrapper>,
    );

    cy.get('svg');
  });
});
