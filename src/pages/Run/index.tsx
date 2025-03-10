import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Run as IRun } from '@/types';
import RunPage from '@pages/Run/RunPage';
import { APIErrorRenderer } from '@components/GenericError';
import Spinner from '@components/Spinner';
import useResource from '@hooks/useResource';

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

  const {
    data: run,
    status,
    error,
  } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    // Make sure that we subsribe to websocket with actual run_number. In some cases we dont have number in url but run id
    wsUrl: parseInt(params.runNumber)
      ? `/flows/${params.flowId}/runs/${params.runNumber}`
      : (result: IRun) => `/flows/${params.flowId}/runs/${result.run_number}`,
    subscribeToEvents: true,
    initialData: null,
  });

  return (
    <div>
      {status === 'Loading' && !run?.run_number && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Spinner md />
        </div>
      )}

      {status === 'Error' && !run?.run_number && (
        <APIErrorRenderer error={error} message={t('timeline.no-run-data') ?? ''} />
      )}

      {(status === 'Ok' || (status === 'Error' && error?.status === 404)) && run?.run_number && (
        <RunPage run={run} params={params} />
      )}
    </div>
  );
};

export default RunContainer;
