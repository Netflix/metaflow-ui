import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ThemeProvider } from 'styled-components';

import Root from './pages/Root';

import { Page } from './components/Structure';
import AppBar from './components/AppBar';

import GlobalStyle from './GlobalStyle';
import theme from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <QueryParamProvider ReactRouterRoute={Route}>
          <AppBar />
          <Page>
            <Root />
          </Page>
        </QueryParamProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
