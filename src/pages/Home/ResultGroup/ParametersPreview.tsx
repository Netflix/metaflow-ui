import React from 'react';
import { useTranslation } from 'react-i18next';
import Collapsable from '../../../components/Collapsable';
import useResource from '../../../hooks/useResource';
import { Run, RunParam } from '../../../types';
import { getRunId } from '../../../utils/run';
import RunParameterTable from '../../Run/RunParameterTable';

const emptyObj = {};

const ParametersPreview: React.FC<{ run: Run }> = ({ run }) => {
  const { t } = useTranslation();
  const params = useResource<RunParam, RunParam>({
    url: `/flows/${run.flow_id}/runs/${getRunId(run)}/parameters`,
    subscribeToEvents: true,
    initialData: emptyObj,
  });

  return (
    <Collapsable title={t('run.parameters') ?? ''} initialState={false}>
      <RunParameterTable params={params} noTitle />
    </Collapsable>
  );
};

export default ParametersPreview;
