import React from 'react';
import { Run, RunParam } from '@/types';
import RunParameterTable from '@pages/Run/RunParameterTable';
import useResource from '@hooks/useResource';

const emptyObj = {};

const ParametersPreview: React.FC<{ run: Run }> = ({ run }) => {
  const params = useResource<RunParam, RunParam>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/parameters`,
    subscribeToEvents: true,
    initialData: emptyObj,
  });

  return <RunParameterTable params={params} noTitle />;
};

export default ParametersPreview;
