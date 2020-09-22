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
      'no-results': 'No runs found',
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
      'reset-all': 'Reset all filters',
      running: 'Running',
      failed: 'Failed',
      completed: 'Completed',
    },

    run: {
      'no-run-data': 'No run data',
      DAG: 'DAG',
      timeline: 'Timeline',
      parameters: 'Parameters',
      'show-run-details': 'Show run details',
      'hide-run-details': 'Hide run details',
      tags: 'Tags',
      'scroll-to-bottom': 'Scroll to bottom',
      'show-fullscreen': 'Show fullscreen',
      'filter-all': 'All',
      'filter-completed': 'Completed',
      'filter-running': 'Running',
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
      'finished-at': 'Finished at',
      duration: 'Duration',
      zoom: 'Zoom',
      'fit-to-screen': 'Fit to screen',
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
      'search-tasks': 'Search tasks: artifact_name=value',
      'no-logs': 'No logs',
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
      'no-results': 'No tasks found',
    },
  },
};

// This model should be used for additional languages to come. For example to add finnish
// language, add file fi.ts and define translation object as const fi: TranslationModel = ....
export type TranslationModel = typeof en;

export default en;
