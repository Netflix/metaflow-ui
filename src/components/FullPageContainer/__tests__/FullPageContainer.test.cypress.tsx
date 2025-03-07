import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import FullPageContainer from '..';

describe('FullPageContainer test', () => {
  it('<FullPageContainer> - closing', () => {
    const onClose = cy.stub();
    mount(
      <TestWrapper>
        <FullPageContainer onClose={onClose}>Hello world</FullPageContainer>
      </TestWrapper>,
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
      <TestWrapper>
        <FullPageContainer onClose={onClose}>Hello world</FullPageContainer>
      </TestWrapper>,
    );
    cy.get('[data-testid="fullpage-content"]').should('contain', 'Hello world');

    // With component
    mount(
      <TestWrapper>
        <FullPageContainer onClose={onClose} component={() => <>Hei maailma</>}>
          Hello world
        </FullPageContainer>
      </TestWrapper>,
    );
    cy.get('[data-testid="fullpage-content"]').should('contain', 'Hei maailma');
  });
});
