import { mount } from '@cypress/react';
import React from 'react';
import { AutoCompleteItem } from '@hooks/useAutoComplete';
import TestWrapper from '@utils/testing';
import AutoComplete from '..';

const resultsTestList = [
  { value: 'test_1', label: 'Test 1' },
  { value: 'test_2', label: 'Test 2' },
  { value: 'test_3', label: 'Test 3' },
];

describe('AutoComplete test', () => {
  it('AutoComplete basic', () => {
    cy.viewport(1000, 600);
    mount(
      <TestWrapper>
        <AutoComplete result={[] as AutoCompleteItem[]} setActiveOption={() => {}} onSelect={() => {}} />
      </TestWrapper>,
    );

    cy.get('[data-testid="autocomplete-popup"]').children().should('have.length', 0);

    mount(
      <TestWrapper>
        <AutoComplete result={resultsTestList} setActiveOption={() => {}} onSelect={() => {}} />
      </TestWrapper>,
    );

    cy.get('[data-testid="autocomplete-popup"]').children().should('have.length', 3);
  });
});
