import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Label from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Label className="test-label">Hei maailma!</Label>
      </ThemeProvider>,
    );
    cy.get('.test-label').should('exist').contains('Hei maailma!');
  });
});
