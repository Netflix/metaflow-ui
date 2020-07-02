import React, { useState } from 'react';
import { useLocation, matchPath, Link, match, useHistory } from 'react-router-dom';
import { PATHS, PathDefinition, getPath } from '../../utils/routing';

type KnownParams = {
  flowId?: string;
  runNumber?: string;
  stepName?: string;
  taskId?: string;
};

/**
 * Find need for various buttons in breadcrumb. This is now very attached to fixed urls we have now
 * so we might need to make this more generic later.
 * @param routeMatch
 * @param location
 */
function findAdditionalButtons(routeMatch: match<KnownParams> | null, location: string) {
  if (routeMatch === null) return [];
  const queryParams = new URLSearchParams(location);
  const buttons = [];
  const params = routeMatch.params;

  if (params.flowId && params.runNumber) {
    buttons.push({
      label: `${params.flowId}/${params.runNumber}`,
      path: getPath.run(params.flowId, params.runNumber),
    });
  }

  // Special case since step name might be found from route params or query params.
  const stepValue = queryParams.get('steps') || params.stepName;
  if (params.flowId && params.runNumber && stepValue) {
    buttons.push({
      label: stepValue,
      path: getPath.step(params.flowId, params.runNumber, stepValue || 'undefined'),
    });
  }

  if (params.flowId && params.runNumber && params.stepName && params.taskId) {
    buttons.push({
      label: params.taskId,
      path: getPath.task(params.taskId, params.runNumber, params.stepName, params.taskId),
    });
  }

  return buttons;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const routeMatch = matchPath<KnownParams>(
    location.pathname,
    Object.keys(PATHS).map((key) => PATHS[key as keyof PathDefinition]),
  );

  const buttonList = findAdditionalButtons(routeMatch, location.search);

  const [edit, setEdit] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ padding: '10px' }}>
        Home
      </Link>

      {!edit &&
        buttonList.map(({ label, path }) => (
          <Link key={path} to={path} style={{ padding: '10px' }}>
            {label}
          </Link>
        ))}

      {edit && (
        <input
          onKeyPress={(e) => {
            if (e.charCode === 13) {
              const parts = e.currentTarget.value.split('/');

              if (parts.length === 2) {
                history.push(getPath.run(parts[0], parts[1]));
              } else if (parts.length === 3) {
                history.push(getPath.step(parts[0], parts[1], parts[2]));
              } else if (parts.length === 4) {
                history.push(getPath.task(parts[0], parts[1], parts[2], parts[3]));
              } else {
                setEdit(false);
              }
            }
          }}
        />
      )}
      <div onClick={() => setEdit(!edit)}>edit</div>
    </div>
  );
};

export default Breadcrumb;
