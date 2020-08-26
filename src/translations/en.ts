//
// Default language
//
const en = {
  translation: {
    items: {
      run: 'Run',
      step: 'Step',
      task: 'Task',
      artifact: 'Artifact',
      metadata: 'Metadata',
    },

    home: {
      home: 'Home',
      'load-more-runs': 'Load more runs',
    },

    fields: {
      flow: 'Flow',
      user: 'User',
      tag: 'Tag',
      project: 'Project',

      flow_id: 'Flow id',

      id: 'Id',
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

      'run-id': 'Run id',
      'task-id': 'Task id',
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
      'expand-all': 'Expand all',
      'collapse-all': 'Collapse all',
      relative: 'Relative',
      absolute: 'Absolute',
      'group-by-step': 'Group by step',
      'order-by': 'Order by',
      'started-at': 'Started at',
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
      'search-tasks': 'Search tasks',
      'no-logs': 'No logs',
    },

    breadcrumb: {
      'no-match': "Text doesn't match known patterns.",
      goto: 'Go to...',
      whereto: 'Where to?',
      example: 'Example',
      'example-run': 'MyFlow / run_id',
      'example-step': 'MyFlow / run_id / step_name',
      'example-task': 'MyFlow / run_id / step_name / task_id',
    },
  },
};

// This model should be used for additional languages to come. For example to add finnish
// language, add file fi.ts and define translation object as const fi: TranslationModel = ....
export type TranslationModel = typeof en;

export default en;
