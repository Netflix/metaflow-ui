import React from 'react';
import { APIErrorRenderer } from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { APIError, AsyncStatus } from '../../../types';

//
// Conditional renderer for async components.
//
type Props = {
  status: AsyncStatus;
  error: APIError | null;
  component: JSX.Element;
  customNotFound?: React.ReactNode;
  minHeight?: number;
};

const SectionLoader: React.FC<Props> = ({ status, error, component, customNotFound, minHeight }) => {
  if (status === 'Loading') {
    return (
      <div style={{ textAlign: 'center', minHeight: minHeight || 'unset' }} data-testid="section-loader-loading">
        <Spinner />
      </div>
    );
  } else if (status === 'Error') {
    return (
      <div style={{ minHeight: minHeight || 'unset' }} data-testid="section-loader-error">
        <APIErrorRenderer error={error} customNotFound={customNotFound} />
      </div>
    );
  }
  return component;
};

export default SectionLoader;
