import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';

import Root from './pages/Root';

import GlobalStyle from './GlobalStyle';
import './theme/font/roboto.css';
import theme from './theme';

import { Page } from './components/Structure';
import AppBar from './components/AppBar';
import { NotificationsProvider, Notifications } from './components/Notifications';
import ErrorBoundary from './components/GeneralErrorBoundary';
import { TimezoneProvider } from './components/TimezoneProvider';
import FeatureFlagLoader from './components/FeatureLoader';
import Logger from './components/Logger';
import AutoScrollTop from './utils/AutoScrollTop';

import { fetchServiceVersion } from './utils/VERSION';
import { fetchFeaturesConfig } from './utils/FEATURE';
import { fetchConfigurations } from './utils/config';
import Announcements from './components/Announcement';

const App: React.FC = () => {
  const { t } = useTranslation();
  // Features list must be fetched before we render application so we don't render things that
  // are disabled by backend service.
  const [flagsReceived, setFlagsReceived] = useState(false);

  useEffect(() => {
    // Get info about backend versions.
    fetchServiceVersion();
    // Get info about features that are enabled by server
    fetchFeaturesConfig(() => setFlagsReceived(true));
    // Get other configurations
    fetchConfigurations();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary message={t('error.application-error')}>
        <NotificationsProvider>
          <TimezoneProvider>
            <GlobalStyle />
            <Router>
              <AutoScrollTop />
              <QueryParamProvider ReactRouterRoute={Route}>
                {flagsReceived ? (
                  <>
                    <Notifications />
                    <Announcements />
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
