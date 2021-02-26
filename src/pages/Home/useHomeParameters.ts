import { useEffect } from 'react';
import { SetQuery, StringParam, useQueryParams, withDefault } from 'use-query-params';

export const defaultHomeParameters = {
  _order: '-ts_epoch',
  _limit: '15',
  _group_limit: '15',
  status: 'completed,failed,running',
};

const ParameterSettings = {
  _group: StringParam,
  _order: withDefault(StringParam, defaultHomeParameters._order),
  _limit: withDefault(StringParam, defaultHomeParameters._limit),
  _group_limit: withDefault(StringParam, defaultHomeParameters._group_limit),
  _tags: StringParam,
  status: withDefault(StringParam, defaultHomeParameters.status),
  flow_id: StringParam,
  user: StringParam,
};

function useHomeParameters(
  onUpdate: (params: Record<string, string>) => void,
): { setQp: SetQuery<typeof ParameterSettings> } {
  const [qp, setQp] = useQueryParams(ParameterSettings);

  useEffect(() => {
    const activeParams = cleanParams(qp);
    // If we are grouping, we should have max 6 in one group.
    activeParams._group_limit = activeParams._group ? '6' : defaultHomeParameters._group_limit;
    onUpdate(activeParams);
  }, [qp, onUpdate]);

  return { setQp };
}

//
// Helper functions
//

//
// Make sure that params object is type of Record<string, string>
//
function cleanParams(qp: any): Record<string, string> {
  return Object.keys(qp).reduce((obj, key) => {
    // Unfortunately withDefault of use-query-params does not default in case of empty string so we need to
    // assing default value for status here by hand
    const value = key === 'status' && qp[key] === '' ? defaultHomeParameters.status : qp[key];
    if (value) {
      return { ...obj, [key]: value };
    }
    return obj;
  }, {});
}

export default useHomeParameters;