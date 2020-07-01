import React from 'react';

import {
  FlowChartWithState,
  INodeDefaultProps,
  INodeInnerDefaultProps,
  ICanvasInnerDefaultProps,
  ICanvasOuterDefaultProps,
  INode,
} from '@mrblenny/react-flow-chart';
import { getStepMeasures, treeExampleSlide16, StepTree, ParallelStep } from './PlayingAroundWithDagDataModel';
import styled from 'styled-components';
import { Step } from '../types';

// Base config for char
const chartSimple = {
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

/**
 * Node
 */

const DarkBox = styled.div<{
  node: INode;
}>`
  position: absolute;
  padding: 30px;
  color: white;
  border-radius: 10px;
  background: ${(props) => (props.node.properties?.type === 'loop' ? 'green' : '#3e3e3e')};

  ${(props) =>
    props.node.properties?.node_type &&
    props.node.properties.node_type === 'parallel' &&
    `
    width: ${props.node.size?.width}px;
    height: ${props.node.size?.height}px;
    background: transparent;
    border: 3px dashed blue;
    opacity: 0.8;
  `};
`;

const NodeCustom = React.forwardRef(
  ({ node, children, ...otherProps }: INodeDefaultProps, ref: React.Ref<HTMLDivElement>) => {
    return (
      <DarkBox ref={ref} node={node} {...otherProps}>
        {children}
      </DarkBox>
    );
  },
);

const NodeInnerCustom = React.forwardRef((props: INodeInnerDefaultProps, ref: React.Ref<HTMLDivElement>) => {
  return <div ref={ref}>{props.node.properties.step_name}</div>;
});

/**
 * Canvas
 */

export const CanvasOuterDefault = styled.div<ICanvasOuterDefaultProps>`
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: not-allowed;
`;

const CanvasOuterCustom = React.forwardRef((props: ICanvasOuterDefaultProps, ref: React.Ref<HTMLDivElement>) => {
  return <CanvasOuterDefault {...props} ref={ref} />;
});

export const CanvasInnerStyle = styled.div<ICanvasInnerDefaultProps>`
  position: relative;
  width: 1000px;
  height: 1000px;
  cursor: move;
`;

const CanvasInnerCustom = React.forwardRef((props: ICanvasInnerDefaultProps) => {
  return <CanvasInnerStyle {...(props as any)} />;
});

function makeChartFromTreeData(tree: Array<StepTree | ParallelStep>) {
  // Use these values to track where next box should be drawn
  let links = {};

  // Make boxes for array of step data
  const makeBoxes = (
    _tree: Array<StepTree | ParallelStep>,
    linear: boolean,
    prefix: string,
    position: { x: number; y: number },
    parentSize: { width: number; height: number },
  ) => {
    let location_x = position.x;
    let location_y = position.y;

    // Make data for all nodes and their children
    const nodes = _tree.reduce((obj, node, index) => {
      location_x = linear ? position.x : location_x;

      const measurements = getStepMeasures(node);

      // Figure out position X for this node BOX
      const getOwnX = (node: StepTree | ParallelStep) => {
        if (!linear || (node.node_type === 'normal' && node.children && node.children.length > 0)) {
          return location_x + measurements.width / 2 - 50;
        } else if (linear) {
          return location_x + parentSize.width / 2 - measurements.width / 2;
        }

        return location_x;
      };

      const nodeId = `${prefix + '.' + index}`;

      // Definition for this node
      const this_node = {
        [nodeId]: {
          id: nodeId,
          type: 'input-output',
          // NOTE: We might want some better way to position boxes. Or maybe just adjust graph offsets
          position: {
            x: getOwnX(node),
            y: location_y,
          },
          size: {
            width: measurements.width,
            height: measurements.height,
          },
          ports: {
            port1: {
              id: 'port1',
              type: 'input',
            },
            port2: {
              id: 'port2',
              type: 'output',
            },
          },
          properties: node,
        },
      };

      // Generate child nodes
      let childNodes = {};
      if (node.node_type === 'parallel') {
        childNodes = makeBoxes(
          node.steps,
          false,
          nodeId,
          { x: location_x + parentSize.width / 2 - measurements.width / 2, y: location_y },
          measurements,
        );
      } else if (node.children && node.children.length > 0) {
        childNodes = makeBoxes(
          node.children,
          true,
          nodeId,
          {
            x: location_x,
            y: location_y + 150,
          },
          measurements,
        );
      }

      // Figure out links that leaves from this node
      const figureOutLinkTargets = () => {
        if (node.node_type === 'parallel') {
          return [];
        }

        if (node.node_type === 'normal' && node.children && node.children.length > 0) {
          if (node.children[0].node_type === 'normal') {
            return [nodeId + '.0'];
          } else {
            return node.children[0].steps.map((_, nIndex) => `${nodeId}.0.${nIndex}`);
          }
        } else if (index < _tree.length - 1 && linear) {
          const next_node = _tree[index + 1];
          const nextNodeId = `${prefix}.${index + 1}`;

          if (next_node.node_type === 'normal') {
            return [nextNodeId];
          } else {
            return next_node.steps.map((_, nIndex) => {
              return `${nextNodeId}.${nIndex}`;
            });
          }
        }
        return [];
      };

      // Make actual link data
      const _links = figureOutLinkTargets().reduce((obj, target, _index) => {
        const linkId = 'link' + prefix + '.' + target + _index;

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

      links = {
        ...links,
        ..._links,
      };

      // move "cursor" where next box should be drawn
      location_x += linear ? 0 : measurements.width;
      location_y += !linear ? 0 : measurements.height;

      return {
        ...obj,
        ...this_node,
        ...childNodes,
      };
    }, {});

    return nodes;
  };

  const nodelist = makeBoxes(tree, true, 'node', { x: 0, y: 0 }, { width: 800, height: 600 });

  return { ...chartSimple, nodes: nodelist, links };
}

/**
 * DAG
 */

interface IDAG {
  steps: Step[];
}

const DAG: React.FC<IDAG> = () => {
  // NOTE We might want some click handlers here and maybe even internal state.
  // Also need to think how to keep state over tab changes. (when switching tabs and coming back to dag)

  return (
    <div>
      <FlowChartWithState
        initialValue={makeChartFromTreeData(treeExampleSlide16)}
        config={chartSimple.config}
        Components={{
          Node: NodeCustom,
          NodeInner: NodeInnerCustom,
          CanvasInner: CanvasInnerCustom,
          CanvasOuter: CanvasOuterCustom,
        }}
      />
    </div>
  );
};

export default DAG;
