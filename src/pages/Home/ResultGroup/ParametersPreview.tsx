import React from 'react';
import { useTranslation } from 'react-i18next';
import { Run, RunParam } from '@/types';
import RunParameterTable from '@pages/Run/RunParameterTable';
import Collapsable from '@components/Collapsable';
import useResource from '@hooks/useResource';

const emptyObj = {};

const ParametersPreview: React.FC<{ run: Run }> = ({ run }) => {
  const { t } = useTranslation();
  const params = useResource<RunParam, RunParam>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/parameters`,
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
