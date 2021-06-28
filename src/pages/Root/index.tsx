import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import NotFound from '../NotFound';
import HomePage from '../Home';
import RunPage from '../Run';
import NotificationsPage from '../Notifications';
import DebugPage from '../Debug';
import { SHORT_PATHS } from '../../utils/routing';
import { analyticsSendPageView } from '../../utils/analytics';

const RootPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    analyticsSendPageView(location.pathname + location.search);
  }, [location.pathname]); // eslint-disable-line

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
