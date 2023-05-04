import React from 'react';
import { mount } from '@cypress/react';
import DAGControlBar from '../components/DAGControlBar';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';

describe('DAGControlBar component', () => {
  it('<DAGControlBar /> - Works', () => {
    const fn = cy.stub();
    mount(
      <ThemeProvider theme={theme}>
        <DAGControlBar setFullscreen={fn} t={(str: any) => str} />
      </ThemeProvider>,
    );
    cy.get('[data-testid="dag-control-fullscreen-button"]')
      .click()
      .then(() => {
        expect(fn).to.have.been.calledWith(true);
      });
  });
});
