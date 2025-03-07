import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import Button from '..';

describe('Button test', () => {
  it('Button click states', () => {
    const onClick = cy.stub();
    mount(
      <TestWrapper>
        <Button active={false} className="my-custom-class" onClick={onClick}>
          test
        </Button>
      </TestWrapper>,
    );
    // check that the button has white background when as default
    cy.get('button')
      .should('exist')
      .should('have.class', 'my-custom-class')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');

    // check that the button has rgb(232, 234, 237) as background when button is clicked active
    mount(
      <TestWrapper>
        <Button active={true} className="my-custom-class" onClick={onClick}>
          test
        </Button>
      </TestWrapper>,
    );
    cy.get('button').should('have.css', 'background-color', 'rgb(232, 234, 237)');

    // reset the button
    mount(
      <TestWrapper>
        <Button active={false} className="my-custom-class" onClick={onClick}>
          test
        </Button>
      </TestWrapper>,
    );
    cy.get('button').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');

    cy.get('button')
      .click()
      .then(() => {
        expect(onClick).to.be.called;
      });
  });
});
