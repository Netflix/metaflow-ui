import { mount } from '@cypress/react';
import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import TestWrapper from '@utils/testing';
import Tabs, { TabDefinition } from '..';

describe('Tabs test', () => {
  it('<Tabs /> - health check', () => {
    mount(
      <TestWrapper>
        <Tabs activeTab="" tabs={[]} />
      </TestWrapper>,
    );
  });

  it('<Tabs /> - Logic check', () => {
    const tabs: TabDefinition[] = [
      { key: 'fstTab', label: 'First', component: <div>First tab here</div> },
      { key: 'sndTab', label: 'Second', component: <div>Second tab here</div>, linkTo: 'link-to-somewhere' },
      { key: 'thTab', label: 'Third', component: <div>Third tab here</div> },
    ];

    mount(
      <TestWrapper>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Tabs activeTab="sndTab" tabs={tabs} />
          </QueryParamProvider>
        </Router>
      </TestWrapper>,
    );

    cy.get('[data-testid="tab-heading-item"]')
      .should('have.length', '3')
      .each((button, index) => {
        cy.wrap(button).contains(tabs[index].label as string);

        if (button.hasClass('active')) {
          cy.wrap(button)
            .should('have.attr', 'href')
            .then(($href) => {
              cy.wrap($href).should('include', '/link-to-somewhere');
            });
        }
      });

    cy.get('[data-testid="tab-active-content"]').contains('Second tab here');

    mount(
      <TestWrapper>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Tabs activeTab="fstTab" tabs={tabs} />
          </QueryParamProvider>
        </Router>
      </TestWrapper>,
    );
    cy.get('[data-testid="tab-active-content"]').contains('First tab here');
  });
});
