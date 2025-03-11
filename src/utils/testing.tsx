import React, { ReactNode } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import GlobalStyle from '../GlobalStyle';
import '../theme/font/roboto.css';
import './i18n';

/**
 * Wrapper for testing component that depends on theming and routing. Also accepts route as param if
 * component depends on certain routes.
 */
const TestWrapper: React.FC<{ children: ReactNode; route?: string }> = ({ children, route = '/' }) => {
  return (
    <>
      <GlobalStyle />
      <MemoryRouter initialEntries={[route]}>
        <QueryParamProvider ReactRouterRoute={Route}>{children}</QueryParamProvider>
      </MemoryRouter>
    </>
  );
};

/**
 * Shorthand function for cy.get(data-testid=param)
 * @param selector testid
 * @returns Cypress.Chainable
 */
export function gid(selector: string): Cypress.Chainable {
  return cy.get(`[data-testid=${selector}]`);
}

export default TestWrapper;
