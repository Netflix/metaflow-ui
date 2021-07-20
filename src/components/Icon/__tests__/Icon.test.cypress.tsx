import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Icon from '..';

describe('Icon test', () => {
  it('<Icon /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Icon name="timeline" />
      </ThemeProvider>
    );
    cy.get('.icon-timeline').should('exist');
  });
});