const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.METAFLOW_SERVICE_PROXY || 'http://localhost:8083',
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api': '/',
      },
    }),
  );
};
