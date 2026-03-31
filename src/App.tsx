import '@theme/font/roboto.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import styled from 'styled-components';
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

type AppProps = {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
};

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
`;

const App: React.FC<AppProps> = ({ toggleTheme, currentTheme }) => {
  const { t } = useTranslation();
  const [flagsReceived, setFlagsReceived] = useState(false);

  useEffect(() => {
    fetchServiceVersion();
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
                    <Wrapper>
                      <TopNavPlugin />
                      <Notifications />
                      <Announcements />
                      <AppBar toggleTheme={toggleTheme} currentTheme={currentTheme} />
                      <Page>
                        <Root />
                      </Page>
                      <Logger />
                    </Wrapper>
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
