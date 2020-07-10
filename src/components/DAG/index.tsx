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

import {
  DAGModel,
  convertDAGModelToIChart,
  defaultChartConfig,
  convertDAGModelToTree,
  DAGStructureTree,
  DAGTreeNode,
} from './DAGUtils';
import { Run, Step } from '../../types';
import { dagexample1, dagexample2, dagexample3, dagHugeflow } from './DAGexamples';
import styled from 'styled-components';
import Button from '../Button';
import useResource from '../../hooks/useResource';

//
// Node
//

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
});

//
// DAG
//

interface IDAG {
  run: Run | null;
}

const DAGContainer: React.FC<IDAG> = ({ run }) => {
  if (!run || !run.run_number) {
    return <>No run data</>;
  }

  return <DAG run={run} />;
};

const DAG: React.FC<{ run: Run }> = ({ run }) => {
  const { data: stepData } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: `/flows/${run.flow_id}/runs/${run.run_number}/steps`,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);
  const [dagChart, setChart] = useState<IChart | null>(null);
  const [dataSet, setDataSet] = useState<DAGModel | null>(null);
  const [mode, setmode] = useState<'fancy' | 'simple'>('simple');

  useEffect(() => {
    if (dataSet) {
      if (mode === 'simple') {
        setDagTree(convertDAGModelToTree(dataSet));
      } else {
        setChart(null);
        setTimeout(() => {
          setChart(convertDAGModelToIChart(dataSet));
        }, 1);
      }
    } else {
      setDagTree(convertDAGModelToTree(dagHugeflow));
    }
  }, [dataSet, mode]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
        <Button onClick={() => setDataSet(dagexample1)}>example1</Button>
        <Button onClick={() => setDataSet(dagexample2)}>example2</Button>
        <Button onClick={() => setDataSet(dagexample3)}>example3</Button>
        <Button onClick={() => setDataSet(dagHugeflow)}>hugeflow</Button>
        <label>Rendering mode</label>
        <Button onClick={() => setmode('fancy')}>fancy{mode === 'fancy' ? ' ✓' : ''}</Button>
        <Button onClick={() => setmode('simple')}>simple{mode === 'simple' ? ' ✓' : ''}</Button>
      </div>
      {dagChart && mode === 'fancy' && (
        <FlowChartWithState
          initialValue={dagChart}
          config={defaultChartConfig.config}
          Components={{
            Node: NodeCustom,
            NodeInner: NodeInnerCustom,
            CanvasInner: CanvasInnerCustom,
            CanvasOuter: CanvasOuterCustom,
          }}
        />
      )}

      {dagTree && mode === 'simple' && (
        <DAGRenderingContainer>
          <div style={{ display: 'flex' }}>
            <NormalItemContainer>
              {dagTree.map((elem, index) => (
                <RenderStep
                  item={elem}
                  key={index}
                  isLast={index + 1 === dagTree.length}
                  stepIds={stepData ? stepData.map((item) => item.step_name) : []}
                />
              ))}
            </NormalItemContainer>
          </div>
        </DAGRenderingContainer>
      )}
    </div>
  );
};

const RenderStep: React.FC<{ item: DAGTreeNode; isLast?: boolean; inContainer?: boolean; stepIds: string[] }> = ({
  item,
  isLast,
  inContainer,
  stepIds,
}) => {
  if (item.node_type === 'normal') {
    const shouldLine = inContainer
      ? (item.children?.length || 0) > 0
      : !isLast || (isLast && (item.children?.length || 0) > 0);

    return (
      <NormalItemContainer className="itemcontainer">
        <NormalItem state={stepIds.indexOf(item.step_name) > -1 ? 'ok' : 'warning'}>
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
              return (
                <RenderStep item={child} isLast={index + 1 === item.children?.length} key={index} stepIds={stepIds} />
              );
            })}
          </NormalItemChildContainer>
        )}
      </NormalItemContainer>
    );
  } else {
    return (
      <ContainerItem containerType={item.container_type}>
        {item.steps &&
          item.steps.map((child, index) => (
            <RenderStep item={child} key={index} inContainer={true} stepIds={stepIds} />
          ))}
        <LineContainer>
          <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <line x1="15" y1="0" x2="15" y2="30" stroke="black" />
          </svg>
        </LineContainer>
      </ContainerItem>
    );
  }
};

const DAGRenderingContainer = styled.div`
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

const NormalItem = styled.div<{ state: 'ok' | 'warning' }>`
  border: 1px solid ${(props) => (props.state === 'ok' ? '#4bd14b' : '#ff7e31')};
  max-width: 200px;
  padding: 10px;
  position: relative;
  transition: 0.15s border;
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

export default DAGContainer;
