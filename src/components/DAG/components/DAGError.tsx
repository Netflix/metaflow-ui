import { TFunction } from 'i18next';
import React from 'react';
import { APIError, Run } from '@/types';
import { APIErrorRenderer } from '@components/GenericError';
import Icon from '@components/Icon';

//
// DAG Error for when something went wrong
//

type DAGErrorProps = {
  error: APIError | null;
  t: TFunction;
  run: Run;
};

const DAGError: React.FC<DAGErrorProps> = ({ error, run }) => (
  <div style={{ padding: '3rem 0' }} data-testid="dag-container-Error">
    <APIErrorRenderer
      error={error}
      icon={<Icon name="noDag" customSize="5rem" />}
      message={{
        'not-found': run.status === 'running' ? 'dag-not-found-running' : 'dag-not-found',
      }}
    />
  </div>
);

export default DAGError;
