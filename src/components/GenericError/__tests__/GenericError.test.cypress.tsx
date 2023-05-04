import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
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
      <ThemeProvider theme={theme}>
        <GenericError message="STOP RIGHT THERE!" />
      </ThemeProvider>,
    );
    expect(cy.contains('STOP RIGHT THERE!')).to.exist;
  });

  it('<GenericError /> - renders with custom icon', () => {
    mount(
      <ThemeProvider theme={theme}>
        <GenericError
          message="STOP RIGHT THERE!"
          icon={<div data-testid="error-custom-icon">you have violated the law</div>}
        />
      </ThemeProvider>,
    );
    expect(cy.get('[data-testid="error-custom-icon"]')).to.exist;
  });

  it('<APIErrorRenderer /> - renders', () => {
    mount(
      <ThemeProvider theme={theme}>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </ThemeProvider>,
    );
    expect(cy.get('[data-testid="generic-error"]')).to.exist;
  });

  it('<APIErrorRenderer /> - renders with custom message', () => {
    mount(
      <ThemeProvider theme={theme}>
        <APIErrorRenderer error={DEFAULT_ERROR} message="they are hacking the mainframe" />
      </ThemeProvider>,
    );
    expect(cy.contains('they are hacking the mainframe')).to.exist;
  });

  it('<APIErrorRenderer /> - renders APIErrorDetails', () => {
    mount(
      <ThemeProvider theme={theme}>
        <APIErrorRenderer error={DEFAULT_ERROR} />
      </ThemeProvider>,
    );
    expect(cy.get('[data-testid="error-details"]')).to.exist;
  });

  it('<APIErrorDetails /> - renders error details accordingly', () => {
    mount(
      <ThemeProvider theme={theme}>
        <APIErrorDetails error={DEFAULT_ERROR} noIcon={false} t={(str: any) => str} />
      </ThemeProvider>,
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
