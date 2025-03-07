import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import VerticalToggle from '..';

describe('VerticalToggle test', () => {
  it('VerticalToggle basic', () => {
    const click = cy.stub();

    cy.viewport(1000, 600);
    mount(
      <TestWrapper>
        <VerticalToggle active={false} onClick={click} visible={false} />
      </TestWrapper>,
    );
    cy.get('[data-testid="vertical-toggle"]').should('not.be.visible');

    mount(
      <TestWrapper>
        <VerticalToggle active={false} onClick={click} visible={true} />
      </TestWrapper>,
    );
    cy.get('[data-testid="vertical-toggle"]').should('be.visible');
  });
});
