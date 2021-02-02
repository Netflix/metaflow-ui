const FEATURE_FLAGS = {
  DAG: (process.env.REACT_APP_FEATURE_DAG || '1') === '1',
  RUN_GROUPS: (process.env.REACT_APP_FEATURE_RUN_GROUPS || '1') === '1',
};

export default FEATURE_FLAGS;
