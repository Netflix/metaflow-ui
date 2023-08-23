import { apiHttp } from '../constants';

const FEATURE_FLAGS = {
  DAG: (process.env.REACT_APP_FEATURE_DAG || '1') === '1',
  RUN_GROUPS: (process.env.REACT_APP_FEATURE_RUN_GROUPS || '0') === '1',
  TASK_METADATA: (process.env.REACT_APP_FEATURE_TASK_METADATA || '1') === '1',
  TIMELINE_MINIMAP: (process.env.REACT_APP_FEATURE_TIMELINE_MINIMAP || '1') === '1',
  ARTIFACT_TABLE: (process.env.REACT_APP_FEATURE_ARTIFACT_TABLE || '0') === '1',
  ARTIFACT_SEARCH: (process.env.REACT_APP_FEATURE_ARTIFACT_SEARCH || '0') === '1',
  DEBUG_VIEW: (process.env.REACT_APP_FEATURE_DEBUG_VIEW || '1') === '1',
  CARDS: (process.env.REACT_APP_FEATURE_CARDS || '1') === '1',

  // Hide visual elements to be used when MFGUI is displayed in an iframe
  HIDE_LOGO: (process.env.REACT_APP_FEATURE_HIDE_LOGO || '0') === '1',
  HIDE_HOME_BUTTON: (process.env.REACT_APP_FEATURE_HIDE_HOME_BUTTON || '0') === '1',
  HIDE_STATUS_FILTERS: (process.env.REACT_APP_FEATURE_HIDE_STATUS_FILTERS || '0') === '1',
  HIDE_TABLE_HEADER: (process.env.REACT_APP_FEATURE_HIDE_TABLE_HEADER || '0') === '1',
  HIDE_QUICK_LINKS: (process.env.REACT_APP_FEATURE_HIDE_QUICK_LINKS || '0') === '1',

  CACHE_DISABLE: false,
  DB_LISTEN_DISABLE: false,
  HEARTBEAT_DISABLE: false,
  PREFETCH_DISABLE: false,
  REFINE_DISABLE: false,
  S3_DISABLE: false,
  WS_DISABLE: false,
};

export type FeatureFlags = typeof FEATURE_FLAGS;

/**
 * Fetch enabled features list from backend.
 * @param onDone Callback to indicate that request is done (success or not)
 */
export function fetchFeaturesConfig(onDone: () => void): void {
  fetch(apiHttp('/features'))
    .then((response) => (response.status === 200 ? response.json() : Promise.resolve(null)))
    .then((values: Record<keyof FeatureFlags, boolean>) => {
      const featureKeys = Object.keys(FEATURE_FLAGS);
      if (values) {
        Object.keys(values).forEach((key) => {
          const fixedKey = key.split('_').slice(1, key.split('_').length).join('_');
          if (featureKeys.indexOf(fixedKey) > -1) {
            FEATURE_FLAGS[fixedKey as keyof FeatureFlags] = values[key as keyof FeatureFlags];
          }
        });
      }
      onDone();
    })
    .catch(() => {
      onDone();
    });
}

window.FEATURES = FEATURE_FLAGS;

export default FEATURE_FLAGS;
