# Feature Flags

## Setting feature flags

Either

`export REACT_APP_FEATURE_FLAG_NAME=true`

Or, in the dockerfile

```
ui_backed:
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
| DEBUG_VIEW          | Expose this view in help menu as a link                                 | true    |
| CARDS               | Show cards on task view                                                 | true    |
| HIDE_LOGO           | Hide Metaflow logo                                                      | false   |
| HIDE_HOME_BUTTON    | Hide Home bitton                                                        | false   |
| HIDE_STATUS_FILTERS | Hide run status filters                                                 | false   |
| HIDE_TABLE_HEADER   | Hide header of runs table                                               | false   |
| HIDE_QUICK_LINKS    | Hide Quick Links button                                                 | false   |
| CACHE_DISABLE       | Disable cache from server side                                          | false   |
| DB_LISTEN_DISABLE   | Disable real time update features from database                         | false   |
| HEARTBEAT_DISABLE   | Disable heartbeat for tasks and runs                                    | false   |
| PREFETCH_DISABLE    | Disable preloading data to cache service                                | false   |
| REFINE_DISABLE      | Disable refined queries for tasks and artifacts                         | false   |
| S3_DISABLE          | Disable fetching extra data from AWS S3                                 | false   |
| WS_DISABLE          | Disable websocket real time messaging                                   | false   |
