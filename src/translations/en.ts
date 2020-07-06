//
// Default language
//
const en = {
  translation: {
    'no-results': 'No results',

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

      id: 'Id',
      status: 'Status',
      'started-at': 'Started at',
      'finished-at': 'Finished at',
      duration: 'Duration',
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
    },

    timeline: {
      'no-run-data': 'No run data. You can wait if this run is created and see live updates.',
      'expand-all': 'Expand all',
      'collapse-all': 'Collapse all',
      relative: 'Relative',
      absolute: 'Absolute',
    },

    breadcrumb: {
      'no-match': "Text doesn't match known patterns.",
      goto: 'Go to...',
      whereto: 'Where to?',
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
