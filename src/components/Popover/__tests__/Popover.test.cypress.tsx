import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import Popover from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <TestWrapper>
        <Popover>Hei maailma!</Popover>
      </TestWrapper>,
    );
    cy.get('[data-testid="popup-wrapper"]').should('exist').contains('Hei maailma!');
  });
});
