import React from 'react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import './i18n';
import theme from '../theme';

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
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </ThemeProvider>
  );
};

export default TestWrapper;
