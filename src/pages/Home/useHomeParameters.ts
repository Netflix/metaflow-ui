import { DecodedValueMap, SetQuery, StringParam, useQueryParams, withDefault } from 'use-query-params';

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

type ParametersMap = DecodedValueMap<typeof ParameterSettings>;

function useHomeParameters(): { setQp: SetQuery<typeof ParameterSettings>; params: Record<string, string> } {
  const [qp, setQp] = useQueryParams(ParameterSettings);
  const params = makeParams(qp);
  return { setQp, params };
}

//
// Helper functions
//

function makeParams(qp: ParametersMap): Record<string, string> {
  const activeParams = cleanParams(qp);
  // If we are grouping, we should have max 6 in one group.
  activeParams._group_limit = activeParams._group ? '6' : defaultHomeParameters._group_limit;
  return activeParams;
}

//
// Make sure that params object is type of Record<string, string>
//
function cleanParams(qp: ParametersMap): Record<string, string> {
  if (typeof qp !== 'object' || !qp) return {};

  const fn = (obj: Record<string, string>, key: keyof ParametersMap): Record<string, string> => {
    // Unfortunately withDefault of use-query-params does not default in case of empty string so we need to
    // assing default value for status here by hand

    const value = key === 'status' && qp[key] === '' ? defaultHomeParameters.status : qp[key];

    if (value) {
      return { ...obj, [key as string]: value } as Record<string, string>;
    }
    return obj;
  };

  const keys = Object.keys(qp) as (keyof ParametersMap)[];

  return keys.reduce(fn, {});
}

export default useHomeParameters;
