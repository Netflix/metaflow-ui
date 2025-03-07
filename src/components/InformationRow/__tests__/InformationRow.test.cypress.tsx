import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import InformationRow from '..';

describe('InformationRow test', () => {
  it('<InformationRow /> - health check', () => {
    mount(
      <TestWrapper>
        <InformationRow data-testid="information-row">Hello</InformationRow>
      </TestWrapper>,
    );
    cy.get('[data-testid="information-row"]').should('exist');
  });
});
