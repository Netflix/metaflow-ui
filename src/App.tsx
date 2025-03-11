import '@theme/font/roboto.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import GlobalStyle from '@/GlobalStyle';
import Root from '@pages/Root';
import Announcements from '@components/Announcement';
import AppBar from '@components/AppBar';
import FeatureFlagLoader from '@components/FeatureLoader';
import ErrorBoundary from '@components/GeneralErrorBoundary';
import Logger from '@components/Logger';
import { Notifications, NotificationsProvider } from '@components/Notifications';
import { PluginsProvider } from '@components/Plugins/PluginManager';
import PluginRegisterSystem from '@components/Plugins/PluginRegisterSystem';
import TopNavPlugin from '@components/Plugins/TopNavPlugin';
import { Page } from '@components/Structure';
import { TimezoneProvider } from '@components/TimezoneProvider';
import { LoggingProvider } from '@hooks/useLogger';
import { fetchFeaturesConfig } from '@utils/FEATURE';
import { fetchServiceVersion } from '@utils/VERSION';
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
