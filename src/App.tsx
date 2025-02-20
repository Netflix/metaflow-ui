import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { useTranslation } from 'react-i18next';

import Root from './pages/Root';

import GlobalStyle from './GlobalStyle';
import './theme/font/roboto.css';

import { Page } from './components/Structure';
import AppBar from './components/AppBar';
import { NotificationsProvider, Notifications } from './components/Notifications';
import ErrorBoundary from './components/GeneralErrorBoundary';
import { TimezoneProvider } from './components/TimezoneProvider';
import { LoggingProvider } from './hooks/useLogger';
import FeatureFlagLoader from './components/FeatureLoader';
import Logger from './components/Logger';

import { fetchServiceVersion } from './utils/VERSION';
import { fetchFeaturesConfig } from './utils/FEATURE';
import Announcements from './components/Announcement';
import { PluginsProvider } from './components/Plugins/PluginManager';
import PluginRegisterSystem from './components/Plugins/PluginRegisterSystem';
import TopNavPlugin from './components/Plugins/TopNavPlugin';

import { appBasePath } from './constants';

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
  }, []);

  return (
    <ErrorBoundary message={t('error.application-error')}>
      <NotificationsProvider>
        <TimezoneProvider>
          <PluginsProvider>
            <LoggingProvider>
              <GlobalStyle />
              <Router basename={appBasePath}>
                <QueryParamProvider ReactRouterRoute={Route}>
                  {flagsReceived ? (
                    <>
                      <TopNavPlugin />
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
            </LoggingProvider>
            <PluginRegisterSystem />
          </PluginsProvider>
        </TimezoneProvider>
      </NotificationsProvider>
    </ErrorBoundary>
  );
};

export default App;
