const metaflowServiceUrl = new URL(process.env.METAFLOW_SERVICE || '/api', document.baseURI);
const protocolWs = metaflowServiceUrl.protocol === 'https:' ? 'wss:' : 'ws:';

export const METAFLOW_SERVICE = metaflowServiceUrl.href;
export const METAFLOW_SERVICE_WS =
  process.env.METAFLOW_SERVICE_WS || `${protocolWs}//${metaflowServiceUrl.host}${metaflowServiceUrl.pathname}/ws`;
