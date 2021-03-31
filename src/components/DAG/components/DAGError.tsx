import { TFunction } from 'i18next';
import React from 'react';
import { APIError } from '../../../types';
import { APIErrorRenderer } from '../../GenericError';
import Icon from '../../Icon';

//
// DAG Error for when something went wrong
//

type DAGErrorProps = {
  error: APIError | null;
  t: TFunction;
};

const DAGError: React.FC<DAGErrorProps> = ({ error }) => (
  <div style={{ padding: '3rem 0' }} data-testid="dag-container-Error">
    <APIErrorRenderer error={error} icon={<Icon name="noDag" customSize={5} />} />
  </div>
);

export default DAGError;
