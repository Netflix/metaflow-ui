//
// Default language
//
const en = {
  translation: {
    items: {
      flow: 'Flow',
      run: 'Run',
      step: 'Step',
      task: 'Task',
      artifact: 'Artifact',
      metadata: 'Metadata',
    },

    home: {
      home: 'Home',
      'show-all-runs': 'Show all runs',
    },

    help: {
      'quick-links': 'Quick links',
    },

    fields: {
      group: {
        none: 'No grouping',
        flow: 'Group by flow',
        user: 'Group by user',
      },

      flow: 'Flow',
      user: 'User',
      tag: 'Tag',
      project: 'Project',
      'user-tags': 'User tags',

      flow_id: 'Flow',

      id: 'ID',
      status: 'Status',
      'started-at': 'Started at',
      'finished-at': 'Finished at',
      language: 'Language',
      duration: 'Duration',

      'artifact-name': 'Artifact name',
      location: 'Location',
      'datastore-type': 'Datastore type',
      type: 'Type',
      'content-type': 'Content type',

      'run-id': 'Run ID',
      'task-id': 'Task ID',
    },

    filters: {
      'group-by': 'Group by',
      'reset-all': 'Reset view',
      running: 'Running',
      failed: 'Failed',
      completed: 'Completed',
    },

    run: {
      'no-run-data': 'No run data',
      DAG: 'DAG',
      'dag-not-available': 'DAG is currently not available',
      'dag-only-available-AWS': 'DAG is only available when flow is executed on AWS.',
      timeline: 'Timeline',
      parameters: 'Parameters',
      'no-run-parameters': 'No run parameters.',
      'run-parameters-error': 'Problem loading run parameters.',
      'show-run-details': 'Show run details',
      'hide-run-details': 'Hide run details',
      tags: 'Tags',
      'select-all-tags': 'Select all tags',
      'scroll-to-bottom': 'Scroll to bottom',
      'show-fullscreen': 'Show fullscreen',
      'filter-all': 'All',
      'filter-completed': 'Completed',
      'filter-running': 'Running',
      'filter-failed': 'Failed',
      overview: 'Overview',
      monitoring: 'Monitoring',
      'error-tracker': 'Error tracker',
      custom: 'Custom',
    },

    timeline: {
      'no-run-data': 'No run data. You can wait if this run is created and see live updates.',
      'no-rows': 'No tasks found',
      'expand-all': 'Expand all',
      'collapse-all': 'Collapse all',
      relative: 'Relative',
      absolute: 'Absolute',
      'group-by-step': 'Group by step',
      'order-by': 'Order by',
      'started-at': 'Started at',
      startTime: 'Started at',
      'finished-at': 'Finished at',
      endTime: 'Finished at',
      duration: 'Duration',
      zoom: 'Zoom',
      'fit-to-screen': 'Fit to screen',
      'show-all-steps': 'Show all steps',
      'order-tasks-by': 'Order tasks by',
      status: 'Status',
      'tasks-visibility': 'Task visibility',
      grouped: 'Group by step',
      'not-grouped': 'Not grouped',
      asc: 'Ascending',
      desc: 'Descending',
    },

    task: {
      loading: 'Loading task data',
      'no-task-selected': 'No task selected',
      'could-not-find-task': 'Could not find the task',
      'task-info': 'Task info',
      links: 'Links',
      'std-out': 'Std out',
      'std-err': 'Std err',
      artifacts: 'Artifacts',
      'search-tasks': 'Search: artifact_name=value',
      'no-logs': 'No logs',
      'logs-only-available-AWS': 'Logs are only available when flow is executed on AWS.',
      attempt: 'Attempt',
      'copy-logs-to-clipboard': 'Copy to clipboard',
      'all-logs-copied': 'Full log copied to clipboard',
      'line-copied': 'Line copied to clipboard',
      'no-artifacts-found': 'No artifacts found',
    },

    breadcrumb: {
      'no-match': "Text doesn't match known patterns.",
      goto: 'Go to...',
      whereto: 'Where to?',
      example: 'Example',
      'example-flow': 'Flow Name',
      'example-run': 'Flow Name / Run ID',
      'example-step': 'Flow Name / Run ID / Step Name',
      'example-task': 'Flow Name / Run ID / Step Name / Task ID',
    },

    search: {
      'no-results': 'No search results',
    },

    connection: {
      'waiting-for-connection': 'Waiting for connection',
      'data-might-be-stale': 'Reconnected, but data might be stale. Click here to reconnect',
    },

    error: {
      'show-more-details': 'Show error details',
      'generic-error': 'Error happened',
      'load-error': 'Error loading data',
      'no-results': 'No results found',
      'no-runs': 'No runs found',
      'no-tasks': 'No tasks found',
      'not-found': 'Resource not found',

      'failed-to-load-dag': 'Failed to load DAG.',
      's3-access-denied': 'Access denied. There was a problem with AWS credentials.',
      's3-not-found': 'S3 bucket was not found.',
      's3-bad-url': 'Error in S3 URL.',
      's3-missing-credentials': 'Server is missing AWS credentials.',
      's3-generic-error': 'There was an error on S3 access.',
      'dag-unsupported-flow-language': 'Unsupported language. DAG is only supported for flows ran with Python.',
      'dag-processing-error': 'DAG was found but something went wrong with processing the data.',

      'log-error-s3': 'There was a problem loading logs from AWS',
      'log-error': 'There was a problem loading logs.',
    },
  },
};

// This model should be used for additional languages to come. For example to add finnish
// language, add file fi.ts and define translation object as const fi: TranslationModel = ....
export type TranslationModel = typeof en;

export default en;
