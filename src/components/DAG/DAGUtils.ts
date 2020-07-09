//
// Types
//

import { IChart } from '@mrblenny/react-flow-chart';

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

type Measures = { width: number; height: number };

//
// Measurement functions
//

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

  node_height += MARGIN.y;

  return { width: max_width, height: node_height };
}

function getParallelMeasures(nodes: DAGStructureTree): Measures {
  let node_width = 0,
    max_height = 0;

  if (nodes.length > 0) {
    nodes.forEach((item) => {
      const { width, height } = getStepMeasures(item);

      max_height = height > max_height ? height : max_height;
      node_width += width + MARGIN.x;
    });
  }

  return { width: node_width, height: max_height };
}

const BOX_SIZE = {
  width: 150,
  height: 100,
};

const MARGIN = {
  x: 20,
  y: 50,
};

export function getStepMeasures(node: DAGTreeNode): Measures {
  let node_width = 0,
    node_height = 0;

  if (node.node_type === 'normal') {
    node_width += node.children && node.children.length > 0 ? 0 : BOX_SIZE.width;
    node_height += BOX_SIZE.height;
  }

  const values =
    node.node_type === 'normal' ? getChildrenMeasures(node.children || []) : getParallelMeasures(node.steps);

  node_width += values.width;
  node_height += values.height;

  return { height: node_height, width: node_width };
}

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

function DAGModelToTree(data: DAGModel, items: string[], breaks: string[]): DAGStructureTree {
  if (items.length > 1) {
    return items.reduce<DAGStructureTree>(
      (arr, item) => [...arr, ...(DAGModelToTree(data, [item], breaks) as any)],
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
          item.box_next && items[0] !== 'end'
            ? [
                {
                  node_type: 'container',
                  container_type: 'parallel',
                  steps: DAGModelToTree(data, item.next, newBreaks),
                },
                ...(item.box_ends ? DAGModelToTree(data, [item.box_ends], breaks) : []),
              ]
            : DAGModelToTree(data, item.next, newBreaks),
        original: item,
      },
    ];
  } else {
    return [];
  }
}

export function convertDAGModelToTree(data: DAGModel): DAGStructureTree {
  return DAGModelToTree(data, ['start'], []);
}

export function convertDAGModelToIChart(data: DAGModel): IChart {
  return convertTreeToIChart(convertDAGModelToTree(data));
}

//
// Tree to chart data
//

export const defaultChartConfig = {
  scale: 1,
  offset: {
    x: 0,
    y: 0,
  },
  nodes: {},
  links: {},
  selected: {},
  hovered: {},
  config: {
    readonly: true,
  },
};

function makeLinks(node: DAGTreeNode, nodeId: string) {
  const nodeLinks = node.node_type === 'normal' && node.original ? node.original.next : [];

  return nodeLinks.reduce((obj, target, _index) => {
    const linkId = nodeId + target;

    return {
      ...obj,
      [linkId]: {
        id: linkId,
        from: {
          nodeId: nodeId,
          portId: 'port2',
        },
        to: {
          nodeId: target,
          portId: 'port1',
        },
      },
    };
  }, {});
}

export function convertTreeToIChart(tree: DAGStructureTree): IChart {
  // Use these values to track where next box should be drawn
  let links = {};

  // Make boxes for array of step data
  const makeBoxes = (
    _tree: DAGStructureTree,
    vertical: boolean,
    prefix: string,
    position: { x: number; y: number },
    parentSize: { width: number; height: number },
  ) => {
    let location_x = position.x;
    let location_y = position.y;

    // Make data for all nodes and their children
    const nodes = _tree.reduce((obj, node, index) => {
      location_x = vertical ? position.x : location_x;

      const measurements = getStepMeasures(node);

      // Figure out position X for this node BOX

      const getHorizontalPosition = (_node: DAGTreeNode) => {
        if (!vertical || (node.node_type === 'normal' && node.children && node.children.length > 0)) {
          return location_x + measurements.width / 2 - BOX_SIZE.width / 2;
        } else if (vertical) {
          return location_x + parentSize.width / 2 - measurements.width / 2;
        }

        return location_x;
      };

      const nodeId = node.node_type === 'normal' ? node.step_name : `${prefix + '.' + index}`;

      const nodePosition = {
        x: getHorizontalPosition(node),
        y: location_y,
      };

      console.log(nodePosition);

      const size = {
        width: measurements.width + (node.node_type === 'container' ? MARGIN.x : 0),
        height: measurements.height + (node.node_type === 'container' ? MARGIN.x : 0),
      };

      const ports =
        node.node_type === 'normal'
          ? {
              ...(node.step_name !== 'start'
                ? {
                    port1: {
                      id: 'port1',
                      type: 'input',
                    },
                  }
                : {}),
              ...(node.step_name !== 'end'
                ? {
                    port2: {
                      id: 'port2',
                      type: 'output',
                    },
                  }
                : {}),
            }
          : {};

      // Definition for this node
      const this_node = {
        [nodeId]: {
          id: nodeId,
          type: 'input-output',
          position: nodePosition,
          size,
          ports,
          properties: node,
        },
      };

      // Generate child nodes
      let childNodes = {};
      if (node.node_type === 'container') {
        childNodes = makeBoxes(
          node.steps,
          false,
          nodeId,
          {
            x: location_x + 10,
            y: location_y + MARGIN.x / 2,
          },
          measurements,
        );
      } else if (node.children && node.children.length > 0) {
        childNodes = makeBoxes(
          node.children,
          true,
          nodeId,
          {
            x: location_x,
            y: location_y + BOX_SIZE.height + MARGIN.y,
          },
          measurements,
        );
      }

      // Extend links object with new links from this node
      links = {
        ...links,
        ...makeLinks(node, nodeId),
      };

      // move "cursor" where next box should be drawn
      location_x += vertical ? 0 : measurements.width + MARGIN.x;
      location_y += !vertical ? 0 : measurements.height + MARGIN.y;

      return {
        ...obj,
        ...this_node,
        ...childNodes,
      };
    }, {});

    return nodes;
  };

  const nodelist = makeBoxes(tree, true, 'node', { x: 0, y: 0 }, { width: 800, height: 600 });

  return { ...defaultChartConfig, nodes: nodelist, links };
}
