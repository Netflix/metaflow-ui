import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import Root from './pages/Root';

import PageLayout from './components/layout/Page';
import AppBar from './components/AppBar';

import GlobalStyle from './GlobalStyle';
import theme from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppBar />
        <PageLayout>
          <Root />
        </PageLayout>
      </Router>
    </ThemeProvider>
  );
}
