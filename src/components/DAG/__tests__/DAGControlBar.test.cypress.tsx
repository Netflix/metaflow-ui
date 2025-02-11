import React from 'react';
import { mount } from '@cypress/react';
import DAGControlBar from '../components/DAGControlBar';
import TestWrapper from '../../../utils/testing';

describe('DAGControlBar component', () => {
  it('<DAGControlBar /> - Works', () => {
    const fn = cy.stub();
    mount(
      <TestWrapper>
        <DAGControlBar setFullscreen={fn} t={(str: any) => str} />
      </TestWrapper>,
    );
    cy.get('[data-testid="dag-control-fullscreen-button"]')
      .click()
      .then(() => {
        expect(fn).to.have.been.calledWith(true);
      });
  });
});
