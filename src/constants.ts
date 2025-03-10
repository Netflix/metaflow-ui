import { FeatureFlags } from '@utils/FEATURE';

declare global {
  interface Window {
    METAFLOW_SERVICE: string;
    APP_BASE_PATH: string | undefined;
    FEATURES: FeatureFlags;
    MF_DEFAULT_TIME_FILTER_DAYS: string;
    METAFLOW_RELOAD_TOKEN: string;
    metaflow_card_update: (payload: object) => void;
    needsReload: boolean;
  }
}
/**
 * Look for metaflow-service base url in following order:
 *
 * 1. `window.METAFLOW_SERVICE` (during runtime, inject via index.html)
 * 2. `process.env.REACT_APP_METAFLOW_SERVICE` (during build)
 * 3. Defaults to '/api'
 */
const metaflowServiceUrl = new URL(
  window.METAFLOW_SERVICE || process.env.REACT_APP_METAFLOW_SERVICE || '/api',
  document.baseURI,
);

export const appBasePath = window.APP_BASE_PATH ?? process.env.REACT_APP_BASE_PATH;

const protocolWs = metaflowServiceUrl.protocol === 'https:' ? 'wss:' : 'ws:';

export const METAFLOW_SERVICE = metaflowServiceUrl.href.replace(/\/$/, '');
export const METAFLOW_SERVICE_WS =
  process.env.REACT_APP_METAFLOW_SERVICE_WS ||
  `${protocolWs}//${metaflowServiceUrl.host}${metaflowServiceUrl.pathname}`.replace(/([^:]\/)\/+/g, '$1');

export const formatUrl = (base: string, path: string): string => `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1');
export const apiHttp = (path: string): string => formatUrl(METAFLOW_SERVICE, path);
export const apiWs = (path: string): string => formatUrl(METAFLOW_SERVICE_WS, path);

/**
 * Look for number of days to display in following order:
 *
 * 1. `window.MF_DEFAULT_TIME_FILTER_DAYS` (during runtime, inject via index.html)
 * 2. `process.env.REACT_APP_MF_DEFAULT_TIME_FILTER_DAYS` (during build)
 * 3. Defaults to 30
 */

const DEFAULT_NUM_DAYS = 30;
export const DEFAULT_TIME_FILTER_DAYS: number =
  (window.MF_DEFAULT_TIME_FILTER_DAYS && parseInt(window.MF_DEFAULT_TIME_FILTER_DAYS, DEFAULT_NUM_DAYS)) ||
  (process.env.REACT_APP_MF_DEFAULT_TIME_FILTER_DAYS &&
    parseInt(process.env.REACT_APP_MF_DEFAULT_TIME_FILTER_DAYS, DEFAULT_NUM_DAYS)) ||
  30;

// The time between polls for new data for cards
export const DYNAMIC_CARDS_REFRESH_INTERVAL =
  process.env.REACT_APP_DYNAMIC_CARDS_REFRESH_INTERVAL !== undefined
    ? Number(process.env.REACT_APP_DYNAMIC_CARDS_REFRESH_INTERVAL)
    : 1000;
