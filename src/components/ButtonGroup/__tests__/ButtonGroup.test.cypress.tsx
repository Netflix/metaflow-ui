import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '@utils/testing';
import ButtonGroup from '..';
import Button from '../../Button';

describe('ButtonGroup test', () => {
  it('ButtonGroup click states', () => {
    const onClick = cy.stub();
    mount(
      <TestWrapper>
        <ButtonGroup>
          <Button onClick={onClick}>test1</Button>
          <Button onClick={onClick}>test2</Button>
          <Button onClick={onClick}>test3</Button>
        </ButtonGroup>
      </TestWrapper>,
    );
    cy.get('button').eq(0).should('have.css', 'border-radius', '4px 0px 0px 4px');
    cy.get('button').eq(1).should('have.css', 'border-radius', '0px');
    cy.get('button').eq(2).should('have.css', 'border-radius', '0px 4px 4px 0px');
    // click through all the buttons
    cy.get('button').each(($button) => {
      cy.wrap($button)
        .click()
        .then(() => {
          expect(onClick).to.be.called;
        });
    });
  });
});
