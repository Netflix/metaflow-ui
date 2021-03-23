import React from 'react';
import { useTranslation } from 'react-i18next';
import Collapsable from '../../components/Collapsable';
import { APIErrorRenderer } from '../../components/GenericError';
import SmoothSpinner from '../../components/Spinner';
import { ItemRow } from '../../components/Structure';
import TitledRow from '../../components/TitledRow';
import useResource from '../../hooks/useResource';
import { Run, RunParam } from '../../types';

//
// Typedef
//

type Props = {
  run: Run;
  initialState?: boolean;
};

//
// Component
//

const RunParameterTable: React.FC<Props> = ({ run, initialState }) => {
  const { t } = useTranslation();

  const { data, status, error } = useResource<RunParam, RunParam>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/parameters`,
    subscribeToEvents: true,
    initialData: {},
  });

  const parameterTableItems = (data ? Object.entries(data) : []).reduce((obj, param) => {
    const [param_name, param_props] = param;
    return { ...obj, [param_name]: param_props.value };
  }, {});

  return (
    <Collapsable title={t('run.parameters')} initialState={initialState}>
      {status === 'Loading' ? (
        <ItemRow margin="md" justify="center">
          <SmoothSpinner sm />
        </ItemRow>
      ) : (
        <TitledRow
          {...(status !== 'Ok' || Object.keys(parameterTableItems).length === 0
            ? {
                type: 'default',
                content:
                  status === 'Error' && error ? (
                    <APIErrorRenderer error={error} message={t('run.run-parameters-error')} />
                  ) : (
                    t('run.no-parameters')
                  ),
              }
            : {
                type: 'table',
                content: parameterTableItems,
              })}
        />
      )}
    </Collapsable>
  );
};

export default RunParameterTable;
