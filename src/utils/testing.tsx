import React from 'react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Route } from 'react-router-dom';
import './i18n';
import theme from '../theme';
import { QueryParamProvider } from 'use-query-params';

export const mockfetch = jest.fn(() =>
  Promise.resolve({
    status: 500,
    json: () => Promise.resolve({}),
  }),
);

/**
 * Wrapper for testing component that depends on theming and routing. Also accepts route as param if
 * component depends on certain routes.
 */
const TestWrapper: React.FC<{ route?: string }> = ({ children, route = '/' }) => {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <QueryParamProvider ReactRouterRoute={Route}>{children}</QueryParamProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
};

export default TestWrapper;
