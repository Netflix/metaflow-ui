const FEATURE_FLAGS = {
  DAG: (process.env.REACT_APP_FEATURE_DAG || '1') === '1',
  RUN_GROUPS: (process.env.REACT_APP_FEATURE_RUN_GROUPS || '1') === '1',
  TASK_METADATA: (process.env.REACT_APP_FEATURE_TASK_METADATA || '1') === '1',
  TIMELINE_MINIMAP: (process.env.REACT_APP_FEATURE_TIMELINE_MINIMAP || '1') === '1',
};

export type FeatureFlags = typeof FEATURE_FLAGS;

window.FEATURES = FEATURE_FLAGS;

export default FEATURE_FLAGS;
