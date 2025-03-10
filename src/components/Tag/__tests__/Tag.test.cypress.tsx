import { mount } from '@cypress/react';
import React from 'react';
import TestWrapper from '@utils/testing';
import Tag, { RemovableTag } from '..';

describe('Tag test', () => {
  it('<Tag /> - health check', () => {
    mount(
      <TestWrapper>
        <Tag>Yo!</Tag>
      </TestWrapper>,
    );
  });

  it('<RemovableTag /> - health check', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <RemovableTag onClick={fn}>Hoy!</RemovableTag>
      </TestWrapper>,
    );

    cy.get('.removable-tag')
      .click()
      .then(() => {
        expect(fn).to.be.calledOnce;
      });
  });
});
