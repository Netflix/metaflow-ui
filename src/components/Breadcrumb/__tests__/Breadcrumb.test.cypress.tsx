import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../../theme';
import { BrowserRouter as Router, MemoryRouter, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import Breadcrumb, { findAdditionalButtons, notEmptyAndEqual, pathFromString } from '..';

const matchWithParams = (params: Record<string, string>) => ({
  isExact: true,
  path: '/',
  url: '/',
  params,
});

describe('Breadcrumb component', () => {
  const RUN_PARAMS = {
    flowId: 'HugeFlow',
    runNumber: '5',
  };

  it('findAdditionalButtons - empty states', () => {
    // Empty returns
    expect(findAdditionalButtons(null, '').length).to.equal(0);
    expect(findAdditionalButtons(matchWithParams({}), '').length).to.equal(0);
  });

  it('findAdditionalButtons - run', () => {
    expect(findAdditionalButtons(matchWithParams(RUN_PARAMS), '')).to.deep.equal([
      {
        label: 'HugeFlow',
        path: '/?flow_id=HugeFlow',
      },
      {
        label: '5',
        path: '/HugeFlow/5/view/timeline',
      },
    ]);
  });

  const STEP_RESULT = [
    {
      label: 'HugeFlow',
      path: '/?flow_id=HugeFlow',
    },
    {
      label: '5',
      path: '/HugeFlow/5/view/timeline',
    },
    {
      label: 'start',
      path: '/HugeFlow/5/view/timeline?steps=start',
    },
  ];

  it('findAdditionalButtons - step by url params', () => {
    expect(
      findAdditionalButtons(
        matchWithParams({
          ...RUN_PARAMS,
          stepName: 'start',
        }),
        '',
      ),
    ).to.deep.equal(STEP_RESULT);
  });

  it('findAdditionalButtons - step by query params', () => {
    expect(findAdditionalButtons(matchWithParams(RUN_PARAMS), '?steps=start')).to.deep.equal(STEP_RESULT);
  });

  it('findAdditionalButtons - tasks', () => {
    expect(findAdditionalButtons(matchWithParams({ ...RUN_PARAMS, stepName: 'start', taskId: '14' }), '')).to.deep.equal([
      ...STEP_RESULT,
      { label: '14', path: '/HugeFlow/5/start/14' },
    ]);
  });

  it('notEmptyAndEqual', () => {
    expect(notEmptyAndEqual('', 'test')).to.be.false;
    expect(notEmptyAndEqual('q', 'test')).to.be.false;
    expect(notEmptyAndEqual('q', '')).to.be.false;
    expect(notEmptyAndEqual('', '')).to.be.false;
    expect(notEmptyAndEqual('test', 'test')).to.be.true;
  });

  it('pathFromString', () => {
    expect(pathFromString('')).to.have.string('/');
    expect(pathFromString('flowName')).to.have.string('/?flow_id=flowName');
    expect(pathFromString('flowName/runId')).to.have.string('/flowName/runId/view/timeline');
    expect(pathFromString('flowName/runId/step')).to.have.string('/flowName/runId/view/timeline?steps=step');
    expect(pathFromString('flowName/runId/step/task')).to.have.string('/flowName/runId/step/task');
    expect(pathFromString('flowName/runId/step/task/error')).to.be.null;
  });

  // Rendering
  it('<Breadcrumb /> - health check', () => {
    mount(
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Breadcrumb />
          </QueryParamProvider>
        </Router>
      </ThemeProvider>
    );
  });

  const makeBreadcrumb: React.FC<{ route?: string }>  = (route) => (
    <ThemeProvider theme={theme}>
        <Router>
          <MemoryRouter initialEntries={[route as Location]}>
            <QueryParamProvider ReactRouterRoute={Route}>
              <Breadcrumb />
            </QueryParamProvider>
          </MemoryRouter>
        </Router>
      </ThemeProvider>
  );

  // Conditional rendering
  it('<Breadcrumb /> - Should render home and empty field', () => {
    mount(makeBreadcrumb('/' as {}));

    cy.get('[data-testid="home-button"]');
    cy.get('[data-testid="breadcrumb-goto-input-inactive"]');
  });

  it('<Breadcrumb /> - Should render button container', () => {
    mount(makeBreadcrumb('/HugeFlow/4/views/timeline' as {}));

    cy.get('[data-testid="home-button"]');
    cy.get('[data-testid="breadcrumb-button-container"]').within($container => {
      cy.wrap($container).get('.button').eq(0).contains('HugeFlow');
      cy.wrap($container).get('.button').eq(1).contains('4');
    });
  });

  it('<Breadcrumb /> - Should render home and after click input field', () => {
    mount(makeBreadcrumb('/' as {}));

    cy.get('[data-testid="breadcrumb-goto-input-inactive"]').click().then(() => {
      cy.get('[data-testid="breadcrumb-goto-container"]').should('exist');
    });
  });
});