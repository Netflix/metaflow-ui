import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import InformationRow from '..';

describe('InformationRow test', () => {
  it('<InformationRow /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <InformationRow data-testid="information-row">Hello</InformationRow>
      </ThemeProvider>,
    );
    cy.get('[data-testid="information-row"]').should('exist');
  });
});
