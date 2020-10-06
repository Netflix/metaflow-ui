import React from 'react';
import { APIErrorRenderer } from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { APIError, AsyncStatus } from '../../../types';

//
// Conditional renderer for async components.
//
type Props = { status: AsyncStatus; error: APIError | null; component: JSX.Element };

const SectionLoader: React.FC<Props> = ({ status, error, component }) => {
  if (status === 'Loading') {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spinner />
      </div>
    );
  } else if (status === 'Error') {
    return (
      <div>
        <APIErrorRenderer error={error} />
      </div>
    );
  }
  return component;
};

export default SectionLoader;
