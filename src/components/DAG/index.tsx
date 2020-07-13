import React, { useState, useEffect } from 'react';

import { DAGModel, convertDAGModelToTree, DAGStructureTree, DAGTreeNode, StepTree } from './DAGUtils';
import { Run, Step } from '../../types';
import { dagexample1, dagexample2, dagexample3, dagHugeflow } from './DAGexamples';
import styled from 'styled-components';
import Button from '../Button';
import useResource from '../../hooks/useResource';

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
    subscribeToEvents: true,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);
  const [dataSet, setDataSet] = useState<DAGModel | null>(null);

  useEffect(() => {
    if (dataSet) {
      setDagTree(convertDAGModelToTree(dataSet));
    } else {
      setDagTree(convertDAGModelToTree(dagHugeflow));
    }
  }, [dataSet]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
        <Button onClick={() => setDataSet(dagexample1)}>example1</Button>
        <Button onClick={() => setDataSet(dagexample2)}>example2</Button>
        <Button onClick={() => setDataSet(dagexample3)}>example3</Button>
        <Button onClick={() => setDataSet(dagHugeflow)}>hugeflow</Button>
      </div>

      {dagTree && (
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

function stateOfStep(item: StepTree, stepIds: string[]) {
  if (stepIds.indexOf(item.step_name) > -1) {
    if (item.original && (stepIds.indexOf(item.original.next[0]) > -1 || item.original?.next.length === 0)) {
      return 'ok';
    }
    return 'running';
  }

  return 'warning';
}

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

    const stepState = stateOfStep(item, stepIds);

    return (
      <NormalItemContainer className="itemcontainer">
        <NormalItem state={stepState}>
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

const NormalItem = styled.div<{ state: 'ok' | 'running' | 'warning' }>`
  border: 1px solid ${(props) => (props.state === 'ok' ? '#4bd14b' : props.state === 'running' ? '#ff7e31' : 'gray')};
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
