import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import FullPageContainer from '..';

describe('FullPageContainer test', () => {
  it('<FullPageContainer> - closing', () => {
    const onClose = cy.stub();
    mount(
      <ThemeProvider theme={theme}>
        <FullPageContainer onClose={onClose}>Hello world</FullPageContainer>
      </ThemeProvider>,
    );

    cy.get('[data-testid="fullpage-close-button"]')
      .click()
      .then(() => {
        expect(onClose).to.have.been.called;
      });
  });

  it('<FullPageContainer> - Content rendering', () => {
    const onClose = cy.stub();
    // With children
    mount(
      <ThemeProvider theme={theme}>
        <FullPageContainer onClose={onClose}>Hello world</FullPageContainer>
      </ThemeProvider>,
    );
    cy.get('[data-testid="fullpage-content"]').should('contain', 'Hello world');

    // With component
    mount(
      <ThemeProvider theme={theme}>
        <FullPageContainer onClose={onClose} component={() => <>Hei maailma</>}>
          Hello world
        </FullPageContainer>
      </ThemeProvider>,
    );
    cy.get('[data-testid="fullpage-content"]').should('contain', 'Hei maailma');
  });
});
