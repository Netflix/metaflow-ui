# Feature Flags

## Setting feature flags

### Environment variable (local development)

```bash
export REACT_APP_FEATURE_DAG=0
yarn start
```

### Docker build argument

All `REACT_APP_FEATURE_*` flags are exposed as build arguments in the Dockerfile with their default values. Override any flag at build time:

```bash
# Disable a single feature
docker build --build-arg REACT_APP_FEATURE_DAG=0 .

# Enable an experimental feature
docker build --build-arg REACT_APP_FEATURE_ARTIFACT_TABLE=1 .

# Combine multiple overrides
docker build \
  --build-arg REACT_APP_FEATURE_HIDE_LOGO=1 \
  --build-arg REACT_APP_FEATURE_HIDE_HOME_BUTTON=1 \
  --build-arg REACT_APP_FEATURE_HIDE_QUICK_LINKS=1 .
```

### Docker Compose

```yaml
services:
  ui:
    build:
      context: .
      args:
        REACT_APP_FEATURE_DAG: '1'
        REACT_APP_FEATURE_ARTIFACT_TABLE: '1'
```

### Backend runtime override

The backend service can also override feature flags at runtime via the `/features` API endpoint. Flags returned by the backend take precedence over build-time values.

```yaml
services:
  ui_backend:
    environment:
      - FEATURE_NAME=1
```

## Available feature flags

| Feature flag        | Description                                                             | Default |
| ------------------- | ----------------------------------------------------------------------- | ------- |
| DAG                 | New tab in runs view which has graphical presentation of the run        | true    |
| RUN_GROUPS          | Grouping feature for runs list on home page                             | false   |
| TASK_METADATA       | Show metadata for each task on task view                                | true    |
| TIMELINE_MINIMAP    | Show rough presentation of lines in timeline minimap                    | true    |
| ARTIFACT_TABLE      | Show artifact table on task view                                        | false   |
| ARTIFACT_SEARCH     | Enable search field in timeline view to filter tasks by artifact values | false   |
| FOREACH_VAR_SEARCH  | In timeline view, filter tasks by foreach variable or values            | false   |
| DEBUG_VIEW          | Expose this view in help menu as a link                                 | true    |
| CARDS               | Show cards on task view                                                 | true    |
| HIDE_LOGO           | Hide Metaflow logo                                                      | false   |
| HIDE_HOME_BUTTON    | Hide Home button                                                        | false   |
| HIDE_STATUS_FILTERS | Hide run status filters                                                 | false   |
| HIDE_TABLE_HEADER   | Hide header of runs table                                               | false   |
| HIDE_QUICK_LINKS    | Hide Quick Links button                                                 | false   |
| HIDE_CONNECTION_STATUS | Hide connection status indicator                                     | false   |
| CACHE_DISABLE       | Disable cache from server side                                          | false   |
| DB_LISTEN_DISABLE   | Disable real time update features from database                         | false   |
| HEARTBEAT_DISABLE   | Disable heartbeat for tasks and runs                                    | false   |
| PREFETCH_DISABLE    | Disable preloading data to cache service                                | false   |
| REFINE_DISABLE      | Disable refined queries for tasks and artifacts                         | false   |
| S3_DISABLE          | Disable fetching extra data from AWS S3                                 | false   |
| WS_DISABLE          | Disable websocket real time messaging                                   | false   |
