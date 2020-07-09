import React, { useState, useEffect } from 'react';

import {
  FlowChartWithState,
  INodeDefaultProps,
  INodeInnerDefaultProps,
  ICanvasInnerDefaultProps,
  ICanvasOuterDefaultProps,
  INode,
  IChart,
} from '@mrblenny/react-flow-chart';
import { DAGModel, convertDAGModelToIChart, defaultChartConfig } from './DAGUtils';
import styled from 'styled-components';
import { Step } from '../../types';
import { dagexample1, dagexample2, dagexample3 } from './DAGexamples';

/**
 * Node
 */

const Box = styled.div<{
  node: INode;
}>`
  position: absolute;
  padding: 30px;
  color: white;
  border-radius: 10px;
  background: ${(props) => (props.node.properties?.type === 'loop' ? 'green' : '#3e3e3e')};

  ${(props) =>
    props.node.properties?.node_type &&
    props.node.properties.node_type === 'container' &&
    `
    width: ${props.node.size?.width}px;
    height: ${props.node.size?.height}px;
    background: transparent;
    border: 3px dashed blue;
    opacity: 0.8;
  `};

  ${(props) =>
    props.node.properties?.node_type &&
    props.node.properties.node_type === 'normal' &&
    `
    width: 150px;
    height: 100px;
  `};
`;

const NodeCustom = React.forwardRef(
  ({ node, children, ...otherProps }: INodeDefaultProps, ref: React.Ref<HTMLDivElement>) => {
    return (
      <Box ref={ref} node={node} {...otherProps}>
        {children}
      </Box>
    );
  },
);

const NodeInnerCustom = React.forwardRef((props: INodeInnerDefaultProps, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref}>
      <div>{props.node.properties.step_name}</div>
      <div>{props.node.properties.original?.box_ends}</div>
    </div>
  );
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

const CanvasInnerCustom = React.forwardRef((props: ICanvasInnerDefaultProps, _) => {
  return <CanvasInnerStyle {...(props as any)} />;
});

/**
 * DAG
 */

interface IDAG {
  steps: Step[];
}

const DAG: React.FC<IDAG> = () => {
  const [dagTree, setDagTree] = useState<IChart | null>(null);
  const [dataSet, setDataSet] = useState<DAGModel | null>(null);

  useEffect(() => {
    setDagTree(null);
    if (dataSet) {
      setTimeout(() => {
        setDagTree(convertDAGModelToIChart(dataSet));
      }, 1);
    }
  }, [dataSet]);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <button onClick={() => setDataSet(dagexample1)}>example1</button>
        <button onClick={() => setDataSet(dagexample2)}>example2</button>
        <button onClick={() => setDataSet(dagexample3)}>example3</button>
      </div>
      {dagTree && (
        <FlowChartWithState
          initialValue={dagTree}
          config={defaultChartConfig.config}
          Components={{
            Node: NodeCustom,
            NodeInner: NodeInnerCustom,
            CanvasInner: CanvasInnerCustom,
            CanvasOuter: CanvasOuterCustom,
          }}
        />
      )}
    </div>
  );
};

export default DAG;
