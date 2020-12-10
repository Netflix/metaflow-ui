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
import { TimezoneProvider } from './components/TimezoneProvider';
import { getRouteMatch } from './utils/routing';
import { apiHttp } from './constants';
import { setServiceVersion } from './VERSION';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = getRouteMatch(pathname);
    // Don't use up feature when on task page, there is some scroll handling
    if (match && match.params.taskId) {
      return;
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    fetch(apiHttp('/version'))
      .then((response) => (response.status === 200 ? response.text() : Promise.resolve('')))
      .then((value) => {
        if (value) {
          setServiceVersion(value);
        }
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary message={t('error.application-error')}>
        <NotificationsProvider>
          <TimezoneProvider>
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
          </TimezoneProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
