import React from 'react';
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';
import NotFound from '../NotFound';
import HomePage from '../Home';
import RunPage from '../Run';
import { PATHS } from '../../utils/routing';

const defaultRunTab = 'view/timeline';

const RootPage: React.FC = () => {
  return (
    <>
      <Switch>
        <Route exact path={PATHS.home}>
          <HomePage />
        </Route>

        <Route path={PATHS.task} exact>
          <div>Task view</div>
        </Route>

        <Route path={PATHS.runSubview}>
          <RunPage />
        </Route>

        <Route path={PATHS.run} exact>
          <DefaultSubRoute path={defaultRunTab} />
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </>
  );
};

export default RootPage;

const DefaultSubRoute = ({ path }: { path: string }) => {
  const { url } = useRouteMatch();

  const separator = url.endsWith('/') ? '' : '/';

  return <Redirect to={`${url}${separator}${path}`} />;
};
