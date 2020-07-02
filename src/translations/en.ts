//
// Default language
//
const en = {
  translation: {
    'no-results': 'No results',

    home: {
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
  },
};

// This model should be used for additional languages to come. For example to add finnish
// language, add file fi.ts and define translation object as const fi: TranslationModel = ....
export type TranslationModel = typeof en;

export default en;
