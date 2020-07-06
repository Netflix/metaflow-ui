import React from 'react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import theme from '../theme';

const TestWrapper: React.FC<{ route?: string }> = ({ children, route = '/' }) => {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </ThemeProvider>
  );
};

export default TestWrapper;
