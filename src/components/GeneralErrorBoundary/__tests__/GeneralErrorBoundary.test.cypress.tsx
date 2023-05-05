import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import ErrorBoundary from '..';

describe('GeneralErrorBoundary test', () => {
  const ErrorMsg = new Error('Error!');
  const CrashingComponent = () => {
    throw ErrorMsg;
  };

  it('<GeneralErrorBoundary /> - Without error', () => {
    mount(
      <ThemeProvider theme={theme}>
        <ErrorBoundary message="error happened">hello world</ErrorBoundary>
      </ThemeProvider>,
    );
    cy.get('div').should('contain', 'hello world');
  });

  it('<GeneralErrorBoundary /> - With error', () => {
    // capture the error separately so that the test won't fail
    cy.on('fail', (err) => {
      expect(err.message).to.include('Error!');
      return false;
    });

    mount(
      <ThemeProvider theme={theme}>
        <ErrorBoundary message="error happened">
          <CrashingComponent />
        </ErrorBoundary>
      </ThemeProvider>,
    ).then(() => {
      cy.get('div').should('have.attr', 'message');
    });
    expect(() => CrashingComponent()).to.throw(ErrorMsg);
  });
});
