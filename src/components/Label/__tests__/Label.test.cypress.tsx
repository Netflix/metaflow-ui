import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import Label from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <TestWrapper>
        <Label className="test-label">Hei maailma!</Label>
      </TestWrapper>,
    );
    cy.get('.test-label').should('exist').contains('Hei maailma!');
  });
});
