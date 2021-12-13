import React from 'react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route } from 'react-router-dom';
import './i18n';
import '../theme/font/roboto.css';
import GlobalStyle from '../GlobalStyle';
import theme from '../theme';
import { QueryParamProvider } from 'use-query-params';

/**
 * Wrapper for testing component that depends on theming and routing. Also accepts route as param if
 * component depends on certain routes.
 */
const TestWrapper: React.FC<{ route?: string }> = ({ children, route = '/' }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <MemoryRouter initialEntries={[route]}>
        <QueryParamProvider ReactRouterRoute={Route}>{children}</QueryParamProvider>
      </MemoryRouter>
    </ThemeProvider>
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
