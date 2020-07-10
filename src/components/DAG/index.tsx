import React, { useState, useEffect } from 'react';
/*
import {
  
  FlowChartWithState,
  INodeDefaultProps,
  INodeInnerDefaultProps,
  ICanvasInnerDefaultProps,
  ICanvasOuterDefaultProps,
  INode,
  IChart,
} from '@mrblenny/react-flow-chart';
*/
import {
  DAGModel,
  //convertDAGModelToIChart /*defaultChartConfig*/,
  convertDAGModelToTree,
  DAGStructureTree,
  DAGTreeNode,
} from './DAGUtils';
// import styled from 'styled-components';
import { Step } from '../../types';
import { dagexample1, dagexample2, dagexample3, dagHugeflow } from './DAGexamples';
import styled from 'styled-components';

//
// Node
//
/*
const Box = styled.div<{
  node: INode;
}>`
  position: absolute;
  padding: 10px;
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
    border: 3px dashed ${props.node.properties?.container_type === 'foreach' ? 'green' : 'blue'};
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

//
// Canvas
//

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
});*/

//
// DAG
//

interface IDAG {
  steps: Step[];
}

const DAG: React.FC<IDAG> = () => {
  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);
  const [dataSet, setDataSet] = useState<DAGModel | null>(null);

  useEffect(() => {
    setDagTree([]);
    if (dataSet) {
      setTimeout(() => {
        setDagTree(convertDAGModelToTree(dataSet));
      }, 1);
    }
  }, [dataSet]);
  console.log(dagTree);
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <button onClick={() => setDataSet(dagexample1)}>example1</button>
        <button onClick={() => setDataSet(dagexample2)}>example2</button>
        <button onClick={() => setDataSet(dagexample3)}>example3</button>
        <button onClick={() => setDataSet(dagHugeflow)}>hugeflow</button>
      </div>
      {/*dagTree && (
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
        )*/}

      {dagTree && (
        <DAGContainer>
          <div style={{ display: 'flex' }}>
            <NormalItemContainer>
              {dagTree.map((elem, index) => (
                <RenderStep item={elem} key={index} isLast={index + 1 === dagTree.length} />
              ))}
            </NormalItemContainer>
          </div>
        </DAGContainer>
      )}
    </div>
  );
};

const RenderStep: React.FC<{ item: DAGTreeNode; isLast?: boolean; inContainer?: boolean }> = ({
  item,
  isLast,
  inContainer,
}) => {
  if (item.node_type === 'normal') {
    const shouldLine = inContainer
      ? (item.children?.length || 0) > 0
      : !isLast || (isLast && (item.children?.length || 0) > 0);

    return (
      <NormalItemContainer className="itemcontainer">
        <NormalItem>
          {item.step_name}
          {shouldLine && (
            <LineContainer>
              <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <line x1="15" y1="0" x2="15" y2="30" stroke="black" />
              </svg>
            </LineContainer>
          )}
        </NormalItem>
        {item.children && item.children.length > 0 && (
          <NormalItemChildContainer className="childcontainer">
            {item.children.map((child, index) => {
              return <RenderStep item={child} isLast={index + 1 === item.children?.length} key={index} />;
            })}
          </NormalItemChildContainer>
        )}
      </NormalItemContainer>
    );
  } else {
    return (
      <ContainerItem containerType={item.container_type}>
        {item.steps && item.steps.map((child, index) => <RenderStep item={child} key={index} inContainer={true} />)}
        <LineContainer>
          <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <line x1="15" y1="0" x2="15" y2="30" stroke="black" />
          </svg>
        </LineContainer>
      </ContainerItem>
    );
  }
};

const DAGContainer = styled.div`
  margin: 0 -45px;
  overflow-x: scroll;
`;

const NormalItemContainer = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
`;

const NormalItem = styled.div`
  border: 1px solid red;
  max-width: 200px;
  padding: 10px;
  position: relative;
`;

const NormalItemChildContainer = styled.div`
  margin-top: 15px;
`;

const ContainerItem = styled.div<{ containerType: 'parallel' | 'foreach' }>`
  border: 1px solid ${(props) => (props.containerType === 'foreach' ? 'green' : 'blue')};
  display: flex;
  margin: 15px;
  position: relative;
`;

const LineContainer = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
`;

export default DAG;
