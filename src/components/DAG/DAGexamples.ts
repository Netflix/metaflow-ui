import { DAGModel } from './DAGUtils';

export const dagexample1: DAGModel = {
  start: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['load_artifacts'],
  },
  load_artifacts: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['split_by_csrgn'],
  },
  split_by_csrgn: {
    type: 'foreach',
    box_next: true,
    box_ends: 'join_content_subregions',
    next: ['split_by_country'],
  },
  split_by_country: {
    type: 'foreach',
    box_next: true,
    box_ends: 'join_countries',
    next: ['load_and_process_data'],
  },
  load_and_process_data: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['predict'],
  },
  predict: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['write_scores_country'],
  },
  write_scores_country: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['prepare_sys_writes'],
  },
  prepare_sys_writes: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join_countries'],
  },
  join_countries: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['write_scores_csrgn'],
  },
  write_scores_csrgn: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['audit_csrgn_predictions'],
  },
  audit_csrgn_predictions: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join_content_subregions'],
  },
  join_content_subregions: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['audit_scores_table'],
  },
  audit_scores_table: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['publish_model_info'],
  },
  publish_model_info: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['publish_to_cbl_csrgn'],
  },
  publish_to_cbl_csrgn: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['write_to_sys'],
  },
  write_to_sys: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['announce'],
  },
  announce: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['end'],
  },
  end: {
    type: 'end',
    box_next: true,
    box_ends: null,
    next: [],
  },
};

export const dagexample2: DAGModel = {
  start: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['split'],
  },
  split: {
    type: 'split-and',
    box_next: true,
    box_ends: 'join',
    next: [
      'wide_branch1',
      'wide_branch2',
      'wide_branch3',
      'wide_branch4',
      'wide_branch5',
      'wide_branch6',
      'wide_branch7',
      'wide_branch8',
      'wide_branch9',
      'wide_branch0',
    ],
  },

  wide_branch1: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch2: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch3: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch4: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch5: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch6: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch7: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch8: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch9: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  wide_branch0: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join'],
  },

  join: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['end'],
  },

  end: {
    type: 'end',
    box_next: true,
    box_ends: null,
    next: [],
  },
};

export const dagexample3: DAGModel = {
  start: {
    type: 'foreach',
    box_next: true,
    box_ends: 'join_level1',
    next: ['level1'],
  },
  level1: {
    type: 'foreach',
    box_next: true,
    box_ends: 'join_level2',
    next: ['level2'],
  },
  level2: {
    type: 'foreach',
    box_next: true,
    box_ends: 'join_level3',
    next: ['level3'],
  },
  level3: {
    type: 'linear',
    box_next: false,
    box_ends: null,
    next: ['join_level3'],
  },
  join_level3: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['join_level2'],
  },
  join_level2: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['join_level1'],
  },
  join_level1: {
    type: 'join',
    box_next: false,
    box_ends: null,
    next: ['end'],
  },
  end: {
    type: 'end',
    box_next: true,
    box_ends: null,
    next: [],
  },
};
