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
export type ParallelStep = {
  node_type: 'parallel';
  steps: Array<StepTree | ParallelStep>;
};

export type StepTree = {
  node_type: 'normal';
  // Was thsi step generating multiple tasks or not?
  type: 'normal' | 'loop';
  // Children presents stuff in linear order. Parallel step to be used for paralllel tasks
  children?: Array<StepTree | ParallelStep>;
  // Name of step, we probably need some other data here as well
  step_name: string;
};

export type RunStructureTree = Array<StepTree | ParallelStep>;

/**
 * Examples
 */

// Array presents linear order of steps. start -> a -> join -> end
export const treeExampleSlide12: RunStructureTree = [
  { node_type: 'normal', step_name: 'start', type: 'normal' },
  { node_type: 'normal', step_name: 'a', type: 'normal' },
  { node_type: 'normal', step_name: 'join', type: 'normal' },
  { node_type: 'normal', step_name: 'end', type: 'normal' },
];

export const treeExampleSlide13: RunStructureTree = [
  { node_type: 'normal', step_name: 'start', type: 'normal' },
  // ParallelStep structure defines here that a and b happens in parallel.
  // Steps in this array is not
  {
    node_type: 'parallel',
    steps: [
      { node_type: 'normal', step_name: 'a', type: 'normal' },
      { node_type: 'normal', step_name: 'b', type: 'normal' },
    ],
  },
  // And after those steps are gone we continue in root level with join
  { node_type: 'normal', step_name: 'join', type: 'normal' },
  { node_type: 'normal', step_name: 'end', type: 'normal' },
];

export const treeExampleSlide14: RunStructureTree = [
  { node_type: 'normal', step_name: 'start', type: 'normal' },
  // B is here created by A so it will be defined in children array of A
  {
    node_type: 'normal',
    step_name: 'A',
    type: 'loop',
    children: [{ node_type: 'normal', step_name: 'B', type: 'normal' }],
  },
  { node_type: 'normal', step_name: 'join', type: 'normal' },
  { node_type: 'normal', step_name: 'end', type: 'normal' },
];

export const treeExampleSlide15: RunStructureTree = [
  { node_type: 'normal', step_name: 'start', type: 'normal' },
  // Again B and joinB are spawned by A so they will be presented in children array of A
  // Children array is also linear presentation of child steps of parent. Here we define order (A, parent ->) B -> joinb
  {
    node_type: 'normal',
    step_name: 'A',
    type: 'loop',
    children: [
      { node_type: 'normal', step_name: 'B', type: 'loop' },
      { node_type: 'normal', step_name: 'joinb', type: 'normal' },
    ],
  },
  // joina defined in root level since it happens after whole A and its children has happened
  { node_type: 'normal', step_name: 'joina', type: 'normal' },
  { node_type: 'normal', step_name: 'end', type: 'normal' },
];

export const treeExampleSlide16: RunStructureTree = [
  { node_type: 'normal', step_name: 'start', type: 'normal' },
  // Use steps object to define parallel steps again
  {
    node_type: 'parallel',
    steps: [
      { node_type: 'normal', step_name: 'a', type: 'normal' },
      {
        node_type: 'normal',
        step_name: 'b',
        type: 'normal',
        // Use children again to present steps spawned by B in linear order. parallel steps -> join1 -> c
        children: [
          {
            node_type: 'parallel',
            steps: [
              {
                node_type: 'normal',
                step_name: 'b1',
                type: 'normal',
                children: [
                  {
                    node_type: 'parallel',
                    steps: [
                      { node_type: 'normal', step_name: 'b11', type: 'normal' },
                      {
                        node_type: 'normal',
                        step_name: 'b12',
                        type: 'normal',
                        children: [
                          {
                            node_type: 'parallel',
                            steps: [
                              {
                                node_type: 'normal',
                                step_name: 'b121',
                                type: 'normal',
                                children: [
                                  {
                                    node_type: 'normal',
                                    step_name: 'b1211',
                                    type: 'normal',
                                    children: [
                                      {
                                        node_type: 'parallel',
                                        steps: [
                                          { node_type: 'normal', step_name: 'b12111', type: 'normal' },
                                          { node_type: 'normal', step_name: 'b12112', type: 'normal' },
                                        ],
                                      },
                                    ],
                                  },
                                  { node_type: 'normal', step_name: 'b1212', type: 'normal' },
                                ],
                              },
                              { node_type: 'normal', step_name: 'b122', type: 'normal' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                node_type: 'normal',
                step_name: 'b2',
                type: 'normal',
                children: [
                  { node_type: 'normal', step_name: 'b21', type: 'normal' },
                  { node_type: 'normal', step_name: 'b22', type: 'normal' },
                ],
              },
              {
                node_type: 'normal',
                step_name: 'b3',
                type: 'normal',
                children: [
                  {
                    node_type: 'parallel',
                    steps: [
                      { node_type: 'normal', step_name: 'b31', type: 'normal' },
                      { node_type: 'normal', step_name: 'b32', type: 'normal' },
                    ],
                  },
                ],
              },
            ],
          },
          { node_type: 'normal', step_name: 'join1', type: 'normal' },
          { node_type: 'normal', step_name: 'c', type: 'normal' },
        ],
      },
    ],
  },
  { node_type: 'normal', step_name: 'join', type: 'normal' },
  { node_type: 'normal', step_name: 'end', type: 'normal' },
];

type Measures = { width: number; height: number };

function getChildrenMeasures(nodes: Array<StepTree | ParallelStep>): Measures {
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

function getParallelMeasures(nodes: Array<StepTree | ParallelStep>): Measures {
  let node_width = 0,
    max_height = 0;

  if (nodes.length > 0) {
    nodes.forEach((item) => {
      const { width, height } = getStepMeasures(item);

      max_height = height > max_height ? height : max_height;
      node_width += width;
    });
  }

  return { width: node_width, height: max_height };
}

/**
 * Find measures for given step.
 */
export function getStepMeasures(node: StepTree | ParallelStep): Measures {
  let node_width = 0,
    node_height = 0;

  if (node.node_type === 'normal') {
    node_width += node.children && node.children.length > 0 ? 0 : 100;
    node_height += 150;
  }

  const values =
    node.node_type === 'normal' ? getChildrenMeasures(node.children || []) : getParallelMeasures(node.steps);

  node_width += values.width;
  node_height += values.height;

  return { height: node_height, width: node_width };
}
