# Metaflow UI Documentation

- [Deployment](deployment.md)
- [Styles](styles.md)
- [Tests](tests.md)
- [Plugin system](plugin-system.md)

## Getting started

Run the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

```bash
$ yarn start
```

Modify Metaflow UI Service proxy and endpoints:

```bash
# Modify development proxy destination (default: http://localhost:8083)
$ METAFLOW_SERVICE_PROXY=http://localhost:8083 yarn start

# Modify both API & Websocket endpoint (default: /api via proxy)
# NOTE: Use this in case proxy is causing problems
$ REACT_APP_METAFLOW_SERVICE=http://localhost:8083 yarn start

# Modify Websocket endpoint (default: same as API with /ws suffix)
$ REACT_APP_METAFLOW_SERVICE_WS=ws://localhost:8083 yarn start
```

Build the app for production to the `build` folder.

```bash
$ yarn build
```

It correctly bundles React in production mode and optimizes the build for the best performance.

## Docker support

Dockerfile provides support for nginx container hosting the production build of the application.

```sh
# Build Docker image
$ docker build --tag metaflow-ui:latest .

# Run Docker container on port 3000
$ docker run -p 3000:3000 metaflow-ui:latest

# Run Docker container using custom API endpoint
$ docker run -p 3000:3000 -e METAFLOW_SERVICE=http://custom-ui-backend/api metaflow-ui:latest
```
