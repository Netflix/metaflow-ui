import React from 'react';
import { mount } from '@cypress/react';
import useOnKeyPress from '..';

describe('useOnKeyPress', () => {
  it('Should trigger on key press', () => {
    const fn = cy.stub();
    const Component = () => {
      useOnKeyPress('T', fn);
      return <div>hello</div>;
    };

    mount(<Component />);

    cy.get('body').trigger('keydown', { key: 'E' });

    cy.wrap({ fn }).its('fn').should('not.have.been.called');

    cy.get('body').trigger('keydown', { key: 'T' });

    cy.wrap({ fn }).its('fn').should('have.been.called');
  });

  it('Should trigger multiple functions on key press', () => {
    const fn = cy.stub();
    const fn2 = cy.stub();
    const fn3 = cy.stub();

    const Component = () => {
      useOnKeyPress('T', fn);
      useOnKeyPress('T', fn2);
      useOnKeyPress('Esc', fn3);
      return <div>hello</div>;
    };

    mount(<Component />);

    cy.get('body').trigger('keydown', { key: 'E' });

    cy.wrap({ fn }).its('fn').should('not.have.been.called');
    cy.wrap({ fn2 }).its('fn2').should('not.have.been.called');
    cy.wrap({ fn3 }).its('fn3').should('not.have.been.called');

    cy.get('body').trigger('keydown', { key: 'T' });

    cy.wrap({ fn }).its('fn').should('have.been.called');
    cy.wrap({ fn2 }).its('fn2').should('have.been.called');
    cy.wrap({ fn3 }).its('fn3').should('not.have.been.called');

    cy.get('body').trigger('keydown', { key: 'Esc' });

    cy.wrap({ fn }).its('fn').should('have.been.called');
    cy.wrap({ fn2 }).its('fn2').should('have.been.called');
    cy.wrap({ fn3 }).its('fn3').should('have.been.called');
  });
});
