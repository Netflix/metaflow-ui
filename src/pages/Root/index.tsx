import React from 'react';
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';
import NotFound from '../NotFound';
import HomePage from '../Home';
import RunPage from '../Run';

// TODO: constants like these could live inside a constants folder
const runPath = '/flows/:flowId/runs/:runNumber';
const defaultRunTab = 'dag';

const RootPage: React.FC = () => {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>

        <Route path={`${runPath}/:viewType`}>
          <RunPage />
        </Route>

        <Route path={runPath}>
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

  return <Redirect to={`${url}/${path}`} />;
};
