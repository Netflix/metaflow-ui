<p align="center">
  <img src="docs/images/mfgui.gif" width="75%" height="75%"/>
</p>


# Metaflow UI

[![Build](https://github.com/Netflix/metaflow-ui/workflows/Build%20and%20test/badge.svg)](https://github.com/Netflix/metaflow-ui/actions) [![GitHub release](https://img.shields.io/github/release/Netflix/metaflow-ui.svg)](https://github.com/Netflix/metaflow-ui/releases/latest)

Metaflow UI is a tool to monitor [Metaflow](https://github.com/Netflix/metaflow) workflows in real-time.

## Getting started

Using Metaflow UI requires [Metaflow Service](https://github.com/Netflix/metaflow-service) for now.

To setup a local development environment, see [docs/README.md](docs/README.md).

### Deploying the UI

Deploying Metaflow UI requires setting up a UI service (which is different from the Metaflow service but uses the same backing database). To deploy the UI service, follow instructions at [Metaflow UI Service](https://github.com/Netflix/metaflow-service).

### Docker support

Dockerfile provides support for an `nginx` container hosting the production build of the application.

```sh
# Build Docker image
$ docker build --tag metaflow-ui:latest .
# Run Docker container on port 3000
$ docker run -p 3000:3000 metaflow-ui:latest
# Run Docker container using custom API endpoint
$ docker run -p 3000:3000 -e METAFLOW_SERVICE=http://custom-ui-backend/api metaflow-ui:latest
```

For example, when used with a locally deployed [Metaflow UI Service](https://github.com/Netflix/metaflow-service), the UI can be launched with

```sh
docker run -p 3000:3000 -e METAFLOW_SERVICE=http://localhost:8083/ metaflow-ui:latest
```

Dockerfile also supports the following environment variables to inject content into the UI's index.html:

- `METAFLOW_HEAD` - Inject content to `head` element
- `METAFLOW_BODY_BEFORE` - Inject content at the beginning of `body` element
- `METAFLOW_BODY_AFTER` - Inject content at the end of `body` element

Use cases for these variables range from additional meta tags to analytics script injection.

Example on how to add a keyword meta tag to Metaflow UI:

```
METAFLOW_HEAD='<meta name="keywords" content="metaflow" />'
```

### Plugins development

See [docs/plugin-system.md](docs/plugin-system.md) to get started with plugins development.

## Running Metaflow UI on WSL2

> **Resolves [Issue #158](https://github.com/Netflix/metaflow-ui/issues/158)** — Step-by-step guide to running Metaflow UI inside WSL2 (Ubuntu).

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Windows 10/11 | 21H2 or later | WSL2 must be enabled |
| WSL2 + Ubuntu | Ubuntu 20.04 / 22.04 | Run `wsl --install` in PowerShell if not installed |
| Node.js | **18.x (LTS)** | Installed via `nvm` inside WSL2 |
| Yarn | 1.x | Installed globally via `npm` |
| Docker Desktop | Latest | Required only if running the backend (Metaflow Service) locally |

> ⚠️ **Important:** All commands below must be run **inside your WSL2 terminal** (not PowerShell or CMD). Clone and work with the repository under the Linux home directory (e.g. `~/`) — **not** under `/mnt/c/...`. Working under `/mnt/c/` causes severe filesystem performance degradation and may break `yarn install`.

---

### Installation

#### 1. Open WSL2

```bash
# In Windows: Start → "Ubuntu" or run in PowerShell:
wsl
```

#### 2. Install Node 18 via nvm

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell (or open a new terminal)
source ~/.bashrc

# Install and use Node 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node -v   # should print v18.x.x
npm -v
```

#### 3. Install Yarn globally

```bash
npm install -g yarn

# Verify
yarn -v   # should print 1.x.x
```

#### 4. Clone the repository inside the Linux filesystem

```bash
# Clone into your Linux home directory (NOT under /mnt/c)
cd ~
git clone https://github.com/Netflix/metaflow-ui.git
cd metaflow-ui
```

#### 5. Install dependencies

```bash
yarn install
```

If you see peer dependency warnings, you can safely ignore them. If you encounter an `ENOSPC` (inotify limit) error:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Then re-run `yarn install`.

---

### Running the Development Server

#### Start the UI (with the default proxy)

```bash
yarn start
```

This starts the development server at **[http://localhost:3000](http://localhost:3000)**.

The UI expects a running [Metaflow Service](https://github.com/Netflix/metaflow-service) backend at `http://localhost:8083` by default. You can customize this:

```bash
# Point the dev proxy to a custom backend URL
METAFLOW_SERVICE_PROXY=http://localhost:8083 yarn start

# Bypass the proxy and talk directly to the backend (useful if proxy causes issues)
REACT_APP_METAFLOW_SERVICE=http://localhost:8083 yarn start

# Customize the WebSocket endpoint separately
REACT_APP_METAFLOW_SERVICE_WS=ws://localhost:8083 yarn start
```

#### Start the backend (Metaflow Service) via Docker

In a separate WSL2 terminal:

```bash
cd ~
git clone https://github.com/Netflix/metaflow-service.git
cd metaflow-service

# Start the backend (recommended for development)
docker-compose -f docker-compose.development.yml up
```

This exposes the Metaflow Service API on port **8083** and the metadata service on port **8080**.

#### Access the UI

Open your Windows browser and navigate to:

```
http://localhost:3000
```

WSL2 automatically forwards ports, so `localhost` works directly from Windows.

---

### Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `yarn start` hangs or crashes | Repository cloned under `/mnt/c/` | Move the repo to `~/metaflow-ui` inside WSL2 |
| `ENOSPC: no space left` or inotify error | Linux inotify watch limit too low | Run `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |
| `command not found: yarn` | Yarn not installed or nvm not loaded | Run `source ~/.bashrc`, then `npm install -g yarn` |
| `command not found: nvm` | nvm not loaded in current shell | Run `source ~/.bashrc` or open a new terminal |
| UI loads but shows no data / all requests fail | Backend not running | Start Metaflow Service: `docker-compose -f docker-compose.development.yml up` inside `metaflow-service/` |
| `ERR_CONNECTION_REFUSED` on port 8083 | Docker Desktop WSL2 integration disabled | In Docker Desktop → Settings → Resources → WSL Integration → enable your Ubuntu distro |
| CORS errors in browser console | UI talking directly to backend without proxy | Use `METAFLOW_SERVICE_PROXY=http://localhost:8083 yarn start` instead of `REACT_APP_METAFLOW_SERVICE` |
| `node: /lib/x86_64-linux-gnu/libc.so.6: version 'GLIBC_2.28' not found` | Wrong Node version for your Ubuntu | Use `nvm install 18 && nvm use 18` |
| Port 3000 already in use | Another process is using the port | Run `lsof -ti:3000 | xargs kill -9`, then retry `yarn start` |

---

## Documentation

See [docs/README.md](docs/README.md) to learn more.

General Metaflow documentation available [here](https://docs.metaflow.org):

## Contributing

We welcome contributions to Metaflow. Please see our [contribution guide](CONTRIBUTING.md) for more details.

## Get in Touch

There are several ways to get in touch with us:

- Open an issue at: https://github.com/Netflix/metaflow-ui
- Email us at: help@metaflow.org
- Chat with us on: http://chat.metaflow.org
