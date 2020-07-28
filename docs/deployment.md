# Metaflow UI deployment

There are 3 recommended ways to deploy Metaflow UI:

1. [Docker container (preferred method)](#1-docker)
2. [Static distribution (e.g. AWS S3 bucket)](#2-static-distribution)
3. [Reverse proxy](#3-reverse-proxy)

## 1. Docker

Fastest and preferred way to deploy Metaflow UI.
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
# Alternatively build using custom API endpoint (this cannot be changed without rebuild)
$ REACT_APP_METAFLOW_SERVICE=http://custom-ui-backend/api yarn build
```

Available environment variables:

| Environment variable         | Description                                                 | Default |
| ---------------------------- | ----------------------------------------------------------- | ------- |
| `REACT_APP_METAFLOW_SERVICE` | UI service API endpoint (cannot be changed without rebuild) | `/api`  |

## 3. Reverse proxy

### Prerequisites:

- Your own custom reverse proxy or HTTP server
- Pre-built static distribution (Option 2.)

See [NGINX template](../nginx.conf.template) for example (this is used in Docker image).
Refer to this configuration template on how to change API endpoint during runtime `index.html`.

API endpoint can also be changed during a build step (see [2. Static distribution](#2-static-distribution)).
