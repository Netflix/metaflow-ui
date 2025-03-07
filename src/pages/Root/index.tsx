import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '@pages/NotFound';
import HomePage from '@pages/Home';
import RunPage from '@pages/Run';
import NotificationsPage from '@pages/Notifications';
import DebugPage from '@pages/Debug';
import { SHORT_PATHS } from '@utils/routing';

const RootPage: React.FC = () => {
  return (
    <>
      <Switch>
        <Route exact path={SHORT_PATHS.home}>
          <HomePage />
        </Route>

        <Route path={SHORT_PATHS.runSubview} exact>
          <RunPage />
        </Route>

        <Route path={SHORT_PATHS.task} exact>
          <RunPage />
        </Route>

        <Route exact path={SHORT_PATHS.step}>
          <RunPage />
        </Route>

        <Route exact path={SHORT_PATHS.run}>
          <RunPage />
        </Route>

        <Route exact path={SHORT_PATHS.notifications}>
          <NotificationsPage />
        </Route>

        <Route exact path={SHORT_PATHS.debug}>
          <DebugPage />
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </>
  );
};

export default RootPage;
