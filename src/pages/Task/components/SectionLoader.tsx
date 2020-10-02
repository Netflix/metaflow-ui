import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericError from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { AsyncStatus } from '../../../types';

//
// Conditional renderer for async components.
//
type Props = { status: AsyncStatus; component: JSX.Element };

const SectionLoader: React.FC<Props> = ({ status, component }) => {
  const { t } = useTranslation();
  if (status === 'Loading') {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spinner />
      </div>
    );
  } else if (status === 'Error') {
    return <GenericError message={t('error.load-error')} />;
  }
  return component;
};

export default SectionLoader;
