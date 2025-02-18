import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import GenericError, { APIErrorDetails, APIErrorRenderer } from '..';

const DEFAULT_ERROR = {
  id: 'generic-error',
  traceback: 'Doing stuff\nERROR!!',
  status: 500,
  title: 'Unknown error',
  detail: 'Absolute failure',
  type: 'error',
};

describe('GenericError test', () => {
  it('<GenericError /> - renders', () => {
    mount(
      <TestWrapper>
        <GenericError message="STOP RIGHT THERE!" />
      </TestWrapper>,
    );
    expect(cy.contains('STOP RIGHT THERE!')).to.exist;
  });

  it('<GenericError /> - renders with custom icon', () => {
    mount(
      <TestWrapper>
        <GenericError
          message="STOP RIGHT THERE!"
          icon={<div data-testid="error-custom-icon">you have violated the law</div>}
        />
      </TestWrapper>,
    );
    expect(cy.get('[data-testid="error-custom-icon"]')).to.exist;
  });

  it('<APIErrorRenderer /> - renders', () => {
    mount(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </TestWrapper>,
    );
    expect(cy.get('[data-testid="generic-error"]')).to.exist;
  });

  it('<APIErrorRenderer /> - renders with custom message', () => {
    mount(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} message="they are hacking the mainframe" />
      </TestWrapper>,
    );
    expect(cy.contains('they are hacking the mainframe')).to.exist;
  });

  it('<APIErrorRenderer /> - renders APIErrorDetails', () => {
    mount(
      <TestWrapper>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </TestWrapper>,
    );
    expect(cy.get('[data-testid="error-details"]')).to.exist;
  });

  it('<APIErrorDetails /> - renders error details accordingly', () => {
    mount(
      <TestWrapper>
        <APIErrorDetails error={DEFAULT_ERROR} noIcon={false} t={(str: any) => str} />
      </TestWrapper>,
    );

    cy.get('[data-testid="collapsable-header"]')
      .click()
      .then(() => {
        cy.get('[data-testid="titled-row-row-status-0"]').contains('500');
        cy.get('[data-testid="titled-row-row-detail-2"]').contains('Absolute failure');
        cy.get('[data-testid="error-details-logs"]').contains('Doing stuff ERROR!!');
      });
    cy.get('[data-testid="collapsable-header"]').click();
  });
});
