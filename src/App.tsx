import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ThemeProvider } from 'styled-components';

import Root from './pages/Root';

import { Page } from './components/Structure';
import AppBar from './components/AppBar';

import GlobalStyle from './GlobalStyle';
import './theme/font/roboto.css';
import theme from './theme';

import { NotificationsProvider, Notifications } from './components/Notifications';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <NotificationsProvider>
        <GlobalStyle />
        <Router>
          <ScrollToTop />
          <QueryParamProvider ReactRouterRoute={Route}>
            <Notifications />
            <AppBar />
            <Page>
              <Root />
            </Page>
          </QueryParamProvider>
        </Router>
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
