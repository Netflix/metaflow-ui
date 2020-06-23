const metaflowServiceUrl = new URL(process.env.REACT_APP_METAFLOW_SERVICE || '/api', document.baseURI);
const protocolWs = metaflowServiceUrl.protocol === 'https:' ? 'wss:' : 'ws:';

export const METAFLOW_SERVICE = metaflowServiceUrl.href.replace(/\/$/, '');
export const METAFLOW_SERVICE_WS =
  process.env.REACT_APP_METAFLOW_SERVICE_WS ||
  `${protocolWs}//${metaflowServiceUrl.host}${metaflowServiceUrl.pathname}/ws`.replace(/([^:]\/)\/+/g, '$1');
