import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Popover from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Popover>Hei maailma!</Popover>
      </ThemeProvider>
    );
    cy.get('[data-testid="popup-wrapper"]').should('exist').contains('Hei maailma!');
  });
});