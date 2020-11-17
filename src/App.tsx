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
import ErrorBoundary from './components/GeneralErrorBoundary';
import { useTranslation } from 'react-i18next';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary message={t('error.application-error')}>
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
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
