import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import Tag, { RemovableTag } from '..';

describe('Tag test', () => {
  it('<Tag /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Tag>Yo!</Tag>
      </ThemeProvider>,
    );
  });

  it('<RemovableTag /> - health check', () => {
    const fn = cy.stub();
    mount(
      <ThemeProvider theme={theme}>
        <RemovableTag onClick={fn}>Hoy!</RemovableTag>
      </ThemeProvider>,
    );

    cy.get('.removable-tag')
      .click()
      .then(() => {
        expect(fn).to.be.calledOnce;
      });
  });
});
