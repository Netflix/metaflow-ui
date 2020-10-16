import { TFunction } from 'i18next';
import React from 'react';
import { APIError } from '../../../types';
import { APIErrorRenderer, DefaultAdditionalErrorInfo, knownErrorIds } from '../../GenericError';
import Icon from '../../Icon';

//
// DAG Error for when something went wrong
//

type DAGErrorProps = {
  error: APIError | null;
  t: TFunction;
};

const DAGError: React.FC<DAGErrorProps> = ({ error, t }) => (
  <div style={{ padding: '3rem 0' }} data-testid="dag-container-Error">
    <APIErrorRenderer
      error={error}
      icon={<Icon name="noDag" customSize={5} />}
      message={DAGErrorMessage(t, error)}
      customNotFound={DefaultAdditionalErrorInfo(t('run.dag-only-available-AWS'))}
    />
  </div>
);

//
// Figure out correct error message for a situation
//

export function DAGErrorMessage(t: TFunction, error: APIError | null): string {
  if (error && knownErrorIds.indexOf(error.id) > -1) {
    if (error.id === 'dag-processing-error' || error.id === 'dag-unsupported-flow-language') {
      return t('error.' + error.id);
    }

    return t(`error.failed-to-load-dag`) + ' ' + t(`error.${error.id}`);
  }
  return t('error.failed-to-load-dag');
}

export default DAGError;
