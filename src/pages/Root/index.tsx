import React, { useContext, useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import NotFound from '../NotFound';
import HomePage from '../Home';
import RunPage from '../Run';
import NotificationsPage from '../Notifications';
import DebugPage from '../Debug';
import { SHORT_PATHS } from '../../utils/routing';
import { analyticsSendPageView } from '../../utils/analytics';
import { PluginsContext } from '../../components/Plugins/PluginManager';
import { getVersionInfo } from '../../utils/VERSION';

const RootPage: React.FC = () => {
  const location = useLocation();
  const { addDataToStore } = useContext(PluginsContext);

  useEffect(() => {
    analyticsSendPageView(location.pathname + location.search);
    addDataToStore('location', location);
  }, [location.pathname]); // eslint-disable-line

  useEffect(() => {
    addDataToStore('appinfo', getVersionInfo());
  }, [addDataToStore]);

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
