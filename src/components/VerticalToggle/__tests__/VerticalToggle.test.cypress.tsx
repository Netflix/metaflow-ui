import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import VerticalToggle from '..';

describe('VerticalToggle test', () => {
  it('VerticalToggle basic', () => {
    const click = cy.stub();

    cy.viewport(1000, 600);
    mount(
      <ThemeProvider theme={theme}>
        <VerticalToggle active={false} onClick={click} visible={false} />
      </ThemeProvider>,
    );
    cy.get('[data-testid="vertical-toggle"]').should('not.be.visible');

    mount(
      <ThemeProvider theme={theme}>
        <VerticalToggle active={false} onClick={click} visible={true} />
      </ThemeProvider>,
    );
    cy.get('[data-testid="vertical-toggle"]').should('be.visible');
  });
});
