import React, { useEffect, useState } from 'react';
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
import Logger from './components/Logger';
import FEATURE_FLAGS, { FeatureFlags } from './FEATURE';
import FeatureFlagLoader from './components/FeatureLoader';

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
  const [flagsReceived, setFlagsReceived] = useState(false);

  useEffect(() => {
    fetch(apiHttp('/version'))
      .then((response) => (response.status === 200 ? response.text() : Promise.resolve('')))
      .then((value) => {
        if (value) {
          setServiceVersion(value);
        }
      });

    fetch(apiHttp('/features'))
      .then((response) => (response.status === 200 ? response.json() : Promise.resolve(null)))
      .then((values: Record<keyof FeatureFlags, boolean>) => {
        const featureKeys = Object.keys(FEATURE_FLAGS);
        if (values) {
          Object.keys(values).forEach((key) => {
            const fixedKey = key.split('_').slice(1, key.split('_').length).join('_');
            if (featureKeys.indexOf(fixedKey) > -1) {
              FEATURE_FLAGS[fixedKey as keyof FeatureFlags] = values[key as keyof FeatureFlags];
            }
          });
        }
        setFlagsReceived(true);
      })
      .catch(() => {
        setFlagsReceived(true);
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
                {flagsReceived ? (
                  <>
                    <Notifications />
                    <AppBar />
                    <Page>
                      <Root />
                    </Page>
                    <Logger />
                  </>
                ) : (
                  <FeatureFlagLoader />
                )}
              </QueryParamProvider>
            </Router>
          </TimezoneProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
