import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import { Run as IRun } from '../../types';

import Spinner from '../../components/Spinner';
import { APIErrorRenderer } from '../../components/GenericError';
import RunPage from './RunPage';

//
// Typedef
//

export type RunPageParams = {
  flowId: string;
  runNumber: string;
  viewType?: string;
  stepName?: string;
  taskId?: string;
};

//
// Component
//

const RunContainer: React.FC = () => {
  const { t } = useTranslation();
  const { params } = useRouteMatch<RunPageParams>();

  const { data: run, status, error } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: true,
    initialData: null,
  });

  return (
    <div>
      {status === 'Loading' && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Spinner md />
        </div>
      )}

      {status === 'Error' && <APIErrorRenderer error={error} message={t('timeline.no-run-data')} />}

      {status === 'Ok' && run?.run_number && <RunPage run={run} params={params} />}
    </div>
  );
};

export default RunContainer;
