type DAGModel = {
  box_ends: string | null;
  type: 'join' | 'foreach' | 'linear' | 'end' | 'start' | 'split-and';
  box_next: boolean;
  next: string[];
};

const data: Record<string, DAGModel> = {
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

/*const data: Record<string, DAGModel> = {
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
};*/

function DAGModelToTree(items: string[], breaks: string[]): DAGStructureTree {
  if (items.length > 1) {
    return items.reduce<DAGStructureTree>((arr, item) => [...arr, ...(DAGModelToTree([item], breaks) as any)], []);
  } else if (items.length === 1) {
    const item = data[items[0]];
    const newBreaks = item.box_ends ? [...breaks, item.box_ends] : breaks;

    if (breaks.indexOf(items[0]) > -1) {
      return [];
    }

    return [
      {
        node_type: 'normal',
        type: item.type === 'foreach' ? 'loop' : 'normal',
        step_name: items[0],
        children:
          item.box_next && items[0] !== 'end'
            ? [
                { node_type: 'container', container_type: 'parallel', steps: DAGModelToTree(item.next, newBreaks) },
                ...(item.box_ends ? DAGModelToTree([item.box_ends], breaks) : []),
              ]
            : DAGModelToTree(item.next, newBreaks),
        original: item,
      },
    ];
  } else {
    return [];
  }
}

export const newModelTree = DAGModelToTree(['start'], []);
console.log(newModelTree);
/**
 * Started by
 */
export type Step = {
  started_by: string[] | string | null;
  type: 'normal' | 'parallel' | 'loop' | 'parallel-loop';
  step_name: string;
};
/**
 * Tree
 */

/**
 * Type definitions
 */

// Presents steps that is running parallel
export type ContainerStep = {
  node_type: 'container';
  container_type: 'parallel' | 'foreach';
  steps: DAGStructureTree;
};

export type StepTree = {
  node_type: 'normal';
  // Was thsi step generating multiple tasks or not?
  type: 'normal' | 'loop';
  // Children presents stuff in linear order. Parallel step to be used for paralllel tasks
  children?: DAGStructureTree;
  // Name of step, we probably need some other data here as well
  step_name: string;
  original?: DAGModel;
};

export type DAGTreeNode = StepTree | ContainerStep;
export type DAGStructureTree = DAGTreeNode[];

type Measures = { width: number; height: number };

function getChildrenMeasures(nodes: DAGStructureTree): Measures {
  let max_width = 0,
    node_height = 0;

  if (nodes.length > 0) {
    nodes.forEach((item) => {
      const { width, height } = getStepMeasures(item);

      max_width = width > max_width ? width : max_width;
      node_height += height;
    });
  }

  return { width: max_width, height: node_height };
}

function getParallelMeasures(nodes: DAGStructureTree): Measures {
  let node_width = 0,
    max_height = 0;

  if (nodes.length > 0) {
    nodes.forEach((item) => {
      const { width, height } = getStepMeasures(item);

      max_height = (height > max_height ? height : max_height) - 50;
      node_width += width;
    });
  }

  return { width: node_width, height: max_height };
}

/**
 * Find measures for given step.
 */
export function getStepMeasures(node: DAGTreeNode): Measures {
  let node_width = 0,
    node_height = 0;

  if (node.node_type === 'normal') {
    node_width += node.children && node.children.length > 0 ? 0 : 150;
    node_height += 150;
  }

  const values =
    node.node_type === 'normal' ? getChildrenMeasures(node.children || []) : getParallelMeasures(node.steps);

  node_width += values.width;
  node_height += values.height;

  return { height: node_height, width: node_width };
}
