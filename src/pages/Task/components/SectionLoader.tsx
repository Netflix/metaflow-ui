import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericError, { APIErrorRendered } from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { APIError, AsyncStatus } from '../../../types';

//
// Conditional renderer for async components.
//
type Props = { status: AsyncStatus; error: APIError | null; component: JSX.Element };

const SectionLoader: React.FC<Props> = ({ status, error, component }) => {
  const { t } = useTranslation();
  if (status === 'Loading') {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spinner />
      </div>
    );
  } else if (status === 'Error') {
    return (
      <div>
        <GenericError message={t('error.load-error')} />
        {error && <APIErrorRendered error={error} />}
      </div>
    );
  }
  return component;
};

export default SectionLoader;
