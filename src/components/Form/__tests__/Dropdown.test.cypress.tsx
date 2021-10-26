import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper, { gid } from '../../../utils/testing';
import Dropdown from '../Dropdown';

const OPTIONS: [string, string][] = [
  ['apple', 'Apple'],
  ['orange', 'Orange'],
  ['banana', 'Banana'],
];

describe('Dropdown', () => {
  it('has optional label', () => {
    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} />
      </TestWrapper>,
    );

    gid('select-label').should('not.exist');

    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} label="hello world" />
      </TestWrapper>,
    );

    gid('select-label').contains('hello world');
  });

  it('should use native select when asked for', () => {
    mount(
      <TestWrapper>
        <Dropdown useNativeComponent options={OPTIONS} />
      </TestWrapper>,
    );
    // Select element should exist and have first option as default value
    cy.get('select').should('have.value', 'apple');
    gid('select-open-button').should('not.exist');
    // Update select value
    cy.get('select').select('banana');
    cy.get('select').should('have.value', 'banana');
  });

  it('should use custom select by default', () => {
    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} />
      </TestWrapper>,
    );
    // Select element should exist and have first option as default value
    cy.get('select').should('have.value', 'apple');

    // Open select
    gid('select-open-button').click();

    gid('option-banana').click();

    cy.get('select').should('have.value', 'banana');
  });

  it('should have value given by value prop', () => {
    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} value="banana" />
      </TestWrapper>,
    );
    cy.get('select').should('have.value', 'banana');
  });

  it('should render custom content with labelRenderer', () => {
    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} labelRenderer={(value, label) => <div>{`custom:${value}:${label}`}</div>} />
      </TestWrapper>,
    );
    gid('select-open-button').contains('custom:apple:Apple');
  });

  it('should render custom content with optionRenderer', () => {
    mount(
      <TestWrapper>
        <Dropdown options={OPTIONS} optionRenderer={(value, label) => <div>{`custom:${value}:${label}`}</div>} />
      </TestWrapper>,
    );
    gid('select-open-button').click();

    gid('option-apple').contains('custom:apple:Apple');
    gid('option-orange').contains('custom:orange:Orange');
    gid('option-banana').contains('custom:banana:Banana').click();
    cy.get('select').should('have.value', 'banana');
  });
});
