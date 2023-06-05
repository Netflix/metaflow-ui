# Metaflow UI deployment

For a complete Metaflow UI production stack deployment (frontend + service + database) please refer to [Cloudformation templates](https://github.com/Netflix/metaflow-tools/tree/master/aws/cloudformation) and [Admin docs](https://admin-docs.metaflow.org/). This is the preferred way to deploy Metaflow UI.

An alternative way is to deploy static frontend separately while connecting to an external backend service:

1. [Docker container](#1-docker)
2. [Static distribution (e.g. AWS S3 bucket)](#2-static-distribution)
3. [Reverse proxy](#3-reverse-proxy)

## 1. Docker

The fastest and preferred way to deploy Metaflow UI.
Static distribution files are served via NGINX reverse proxy inside the container.

### Prerequisites:

- Docker

```sh
# Build Docker image
$ docker build --tag metaflow-ui:latest .

# Run Docker container on port 3000
$ docker run -p 3000:3000 metaflow-ui:latest
```

```sh
# Alternatively run using custom API endpoint
$ docker run -p 3000:3000 -e METAFLOW_SERVICE=http://custom-ui-backend/api metaflow-ui:latest
```

Available environment variables:

| Environment variable | Description             | Default |
| -------------------- | ----------------------- | ------- |
| `PORT`               | Exposed port            | `3000`  |
| `METAFLOW_SERVICE`   | UI service API endpoint | `/api`  |

## 2. Static distribution

### Prerequisites:

- Node.js
- Yarn
- AWS CLI (in case of S3 distribution)

```sh
# Install dependencies
$ yarn

# Build static distribution
$ yarn build

# Upload to S3 bucket using AWS CLI
$ aws s3 sync ./build s3://bucket-name
```

```sh
# Alternatively build using a custom API endpoint (this cannot be changed without a rebuild)
$ REACT_APP_METAFLOW_SERVICE=http://custom-ui-backend/api yarn build
```

Available environment variables:

| Environment variable         | Description                                                   | Default |
| ---------------------------- | ------------------------------------------------------------- | ------- |
| `REACT_APP_METAFLOW_SERVICE` | UI service API endpoint (cannot be changed without a rebuild) | `/api`  |
| `REACT_APP_BASE_PATH`        | Base path override for UI (e.g. `/some/new/path`)             | ``      |

## 3. Reverse proxy

### Prerequisites:

- Your own custom reverse proxy or HTTP server
- Pre-built static distribution (Option 2.)

See [NGINX template](../nginx.conf.template) for an example (this is used in the Docker image).
Refer to this configuration template on how to change the API endpoint during runtime `index.html`.

The API endpoint can also be changed during a build step (see [2. Static distribution](#2-static-distribution)).
