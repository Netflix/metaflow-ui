declare global {
  interface Window {
    METAFLOW_SERVICE: string;
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
const protocolWs = metaflowServiceUrl.protocol === 'https:' ? 'wss:' : 'ws:';

export const METAFLOW_SERVICE = metaflowServiceUrl.href.replace(/\/$/, '');
export const METAFLOW_SERVICE_WS =
  process.env.REACT_APP_METAFLOW_SERVICE_WS ||
  `${protocolWs}//${metaflowServiceUrl.host}${metaflowServiceUrl.pathname}`.replace(/([^:]\/)\/+/g, '$1');

export const formatUrl = (base: string, path: string): string => `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1');
export const apiHttp = (path: string): string => formatUrl(METAFLOW_SERVICE, path);
export const apiWs = (path: string): string => formatUrl(METAFLOW_SERVICE_WS, path);
