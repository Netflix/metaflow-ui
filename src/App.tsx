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

import { NotificationsProvider, Notifications, useNotifications, NotificationType } from './components/Notifications';
import ResourceEvents from './ws';

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
        <WebsocketNotifications />
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

const WebsocketNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const onOpen = () => {
      addNotification({
        uuid: 'websocket-connection-established',
        type: NotificationType.Success,
        message: 'Websocket connection established',
      });
    };

    const onClose = () => {
      addNotification(
        {
          uuid: 'websocket-connection-lost',
          type: NotificationType.Warning,
          message: 'Websocket connection lost',
        },
        {
          uuid: 'websocket-reconnecting',
          type: NotificationType.Info,
          message: 'Reconnecting to websocket',
        },
      );
    };

    ResourceEvents.addEventListener('open', onOpen);
    ResourceEvents.addEventListener('close', onClose);

    return () => {
      ResourceEvents.removeEventListener('open', onOpen);
      ResourceEvents.removeEventListener('close', onClose);
    };
  }, [addNotification]);

  return <></>;
};
