import React from 'react';
import { useTranslation } from 'react-i18next';
import { RunParam } from '@/types';
import { APIErrorRenderer } from '@components/GenericError';
import SmoothSpinner from '@components/Spinner';
import { ItemRow } from '@components/Structure';
import TitledRow from '@components/TitledRow';
import { Resource } from '@hooks/useResource';

//
// Typedef
//

type Props = {
  params: Resource<RunParam>;
  noTitle?: boolean;
};

//
// Component
//

const RunParameterTable: React.FC<Props> = ({ params, noTitle = false }) => {
  const { t } = useTranslation();

  const parameterTableItems = (params.data ? Object.entries(params.data) : []).reduce((obj, param) => {
    const [param_name, param_props] = param;
    return { ...obj, [param_name]: param_props.value };
  }, {});

  return params.status === 'Loading' ? (
    <ItemRow margin="md" justify="center">
      <SmoothSpinner sm />
    </ItemRow>
  ) : (
    <TitledRow
      title={(noTitle ? undefined : t('run.parameters')) ?? undefined}
      {...(params.status !== 'Ok' || Object.keys(parameterTableItems).length === 0
        ? {
            type: 'default',
            content:
              params.status === 'Error' && params.error ? (
                <APIErrorRenderer error={params.error} message={t('run.run-parameters-error') ?? ''} />
              ) : (
                t('run.no-parameters')
              ),
          }
        : {
            type: 'table',
            content: parameterTableItems,
          })}
    />
  );
};

export default RunParameterTable;
