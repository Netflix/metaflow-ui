import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import ShowDetailsButton from '..';

describe('ShowDetailsButton test', () => {
  it('ShowDetailsButton health check', () => {
    const toggle = cy.stub();
    mount(
      <ThemeProvider theme={theme}>
        <ShowDetailsButton toggle={toggle} visible={false} showText="Yep" hideText="Nop" data-testid="test-showDetailsButton" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="test-showDetailsButton"]').should('have.text', 'Yep');

    mount(
      <ThemeProvider theme={theme}>
        <ShowDetailsButton toggle={toggle} visible={true} showText="Yep" hideText="Nop" data-testid="test-showDetailsButton" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="test-showDetailsButton"]').should('have.text', 'Nop');
  });
});