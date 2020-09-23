//
// Types
//

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
  original?: DAGModelItem;
};

export type DAGTreeNode = StepTree | ContainerStep;
export type DAGStructureTree = DAGTreeNode[];

//
// Converting API data to be a tree.
//

export type DAGModelItem = {
  // Is paired with box_next, defines how far will next box gonna be drawn
  box_ends: string | null;
  // Type of step
  type: 'join' | 'foreach' | 'linear' | 'end' | 'start' | 'split-and';
  // Should draw box after this step?
  box_next: boolean;
  // Next step(s)
  next: string[];
};

export type DAGModel = Record<string, DAGModelItem>;

function DAGModelToTree(data: DAGModel, items: string[], breaks: string[], inContainer?: boolean): DAGStructureTree {
  if (items.length > 1) {
    return items.reduce<DAGStructureTree>(
      (arr, item) => [...arr, ...(DAGModelToTree(data, [item], breaks, inContainer) as any)],
      [],
    );
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
          inContainer && item.box_next && items[0] !== 'end'
            ? [
                {
                  node_type: 'container',
                  container_type: item.type === 'foreach' ? ('foreach' as const) : ('parallel' as const),
                  steps: DAGModelToTree(data, item.next, newBreaks, true),
                },
                ...(inContainer && item.box_ends ? DAGModelToTree(data, [item.box_ends], breaks) : []),
              ]
            : inContainer && !item.box_next
            ? DAGModelToTree(data, item.next, newBreaks)
            : [],
        original: item,
      },
      ...(!inContainer && item.box_ends
        ? [
            {
              node_type: 'container' as const,
              container_type: item.type === 'foreach' ? ('foreach' as const) : ('parallel' as const),
              steps: DAGModelToTree(data, item.next, newBreaks, true),
            },
            ...DAGModelToTree(data, [item.box_ends], breaks),
          ]
        : []),
      ...(!inContainer && !item.box_ends ? DAGModelToTree(data, item.next, newBreaks) : []),
    ];
  } else {
    return [];
  }
}

export function convertDAGModelToTree(data: DAGModel): DAGStructureTree {
  if (Object.keys(data).length === 0) {
    return [];
  }
  return DAGModelToTree(data, ['start'], []);
}
