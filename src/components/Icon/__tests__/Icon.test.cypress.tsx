import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import Icon from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <TestWrapper>
        <Icon name="timeline" />
      </TestWrapper>,
    );
    cy.get('.icon-timeline').should('exist');
  });
});
