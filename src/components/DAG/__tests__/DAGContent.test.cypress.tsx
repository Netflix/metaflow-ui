
import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import { createRun } from '../../../utils/testhelper';
import { ContainerElement, RenderStep } from '../components/DAGContent';

describe('DAGContent components', () => {
  it('<ContainerElement /> - should render parallel container', () => {
    mount(
      <ThemeProvider theme={theme}>
        <ContainerElement containerType="parallel" />
      </ThemeProvider>
    );
    cy.get('[data-testid="dag-parallel-container"]').should('exist');
  });

  it('<ContainerElement /> - should render foreach container', () => {
    mount(
      <ThemeProvider theme={theme}>
        <ContainerElement containerType="foreach" />
      </ThemeProvider>
    );
    cy.get('[data-testid="dag-foreach-container"]').should('exist');
  });

  it('<RenderStep /> - should render Normalitem', () => {
   mount(
      <ThemeProvider theme={theme}>
        <RenderStep
          item={{
            node_type: 'normal',
            type: 'normal',
            step_name: 'start',
            children: [
              {
                node_type: 'normal',
                type: 'normal',
                step_name: 'a',
                children: [],
                original: {
                  type: 'linear',
                  box_next: false,
                  box_ends: null,
                  next: ['join'],
                },
              },
            ],
            original: {
              type: 'split-and',
              box_next: true,
              box_ends: 'join',
              next: ['a'],
            },
          }}
          stepData={[]}
          run={createRun({})}
        />
      </ThemeProvider>
    );

    cy.get('[data-testid="dag-normalitem"]').should('have.length','2');
    cy.get('[data-testid="dag-normalitem-children').children().should('have.length', '1');
    cy.get('[data-testid="dag-normalitem-box"]').eq(0).contains('start');
    cy.get('[data-testid="dag-normalitem-box"]').eq(1).contains('a');
  });

  it('<RenderStep /> - should render ContainerItem', () => {
    mount(
      <ThemeProvider theme={theme}>
        <RenderStep
          item={{
            node_type: 'container',
            container_type: 'parallel',
            steps: [],
          }}
          stepData={[]}
          run={createRun({})}
        />
      </ThemeProvider>
    );

    cy.get('[data-testid="dag-parallel-container"]').should('exist');
  });
});