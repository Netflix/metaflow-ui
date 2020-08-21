import React, { useState, useEffect } from 'react';

import { DAGModel, convertDAGModelToTree, DAGStructureTree, DAGTreeNode, StepTree } from './DAGUtils';
import { Run, Step } from '../../types';
import { dagexample1, dagexample2, dagexample3, dagHugeflow } from './DAGexamples';
import styled, { css } from 'styled-components';
import Button from '../Button';
import { ItemRow } from '../Structure';
import useResource from '../../hooks/useResource';
import { useHistory } from 'react-router-dom';
import { getPath } from '../../utils/routing';
import Notification, { NotificationType } from '../Notification';
import FullPageContainer from '../FullPageContainer';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { data: stepData } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: true,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  const [showFullscreen, setFullscreen] = useState(false);
  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);
  const [dataSet, setDataSet] = useState<DAGModel | null>(null);

  useEffect(() => {
    if (dataSet) {
      setDagTree(convertDAGModelToTree(dataSet));
    } else {
      setDagTree(convertDAGModelToTree(dagHugeflow));
    }
  }, [dataSet]);

  const content = dagTree && (
    <DAGRenderingContainer showFullscreen={showFullscreen}>
      <div style={{ display: 'flex' }}>
        <NormalItemContainer>
          {dagTree.map((elem, index) => (
            <RenderStep
              run={run}
              item={elem}
              key={index}
              isLast={index + 1 === dagTree.length}
              stepIds={stepData ? stepData.map((item) => item.step_name) : []}
            />
          ))}
        </NormalItemContainer>
      </div>
    </DAGRenderingContainer>
  );

  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: '0 0 10px 0' }}>
        <Notification type={NotificationType.Info}>
          Note! These examples are hardcoded and they do not present the state of your run.
        </Notification>
      </div>
      <ItemRow pad="sm">
        <Button onClick={() => setDataSet(dagexample1)}>example1</Button>
        <Button onClick={() => setDataSet(dagexample2)}>example2</Button>
        <Button onClick={() => setDataSet(dagexample3)}>example3</Button>
        <Button onClick={() => setDataSet(dagHugeflow)}>hugeflow</Button>
        <Button onClick={() => setFullscreen(true)}>{t('run.show-fullscreen')}</Button>
      </ItemRow>

      {showFullscreen ? <FullPageContainer onClose={() => setFullscreen(false)}>{content}</FullPageContainer> : content}
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

const RenderStep: React.FC<{
  item: DAGTreeNode;
  isLast?: boolean;
  inContainer?: boolean;
  stepIds: string[];
  run: Run;
}> = ({ item, isLast, inContainer, stepIds, run }) => {
  const history = useHistory();
  if (item.node_type === 'normal') {
    const shouldLine = inContainer
      ? (item.children?.length || 0) > 0
      : !isLast || (isLast && (item.children?.length || 0) > 0);

    const stepState = stateOfStep(item, stepIds);

    return (
      <NormalItemContainer className="itemcontainer">
        <NormalItem
          state={stepState}
          onClick={() => {
            history.push(getPath.step(run.flow_id, run.run_number, item.step_name));
          }}
        >
          {item.step_name}
          {shouldLine && (
            <LineContainer>
              <LineElement />
            </LineContainer>
          )}
        </NormalItem>
        {item.children && item.children.length > 0 && (
          <NormalItemChildContainer className="childcontainer">
            {item.children.map((child, index) => {
              return (
                <RenderStep
                  run={run}
                  item={child}
                  isLast={index + 1 === item.children?.length}
                  key={index}
                  stepIds={stepIds}
                />
              );
            })}
          </NormalItemChildContainer>
        )}
      </NormalItemContainer>
    );
  } else {
    return (
      <ContainerElement containerType={item.container_type}>
        {item.steps &&
          item.steps.map((child, index) => (
            <RenderStep run={run} item={child} key={index} inContainer={true} stepIds={stepIds} />
          ))}
      </ContainerElement>
    );
  }
};

const ContainerElement: React.FC<{ containerType: 'parallel' | 'foreach' }> = ({ containerType, children }) => {
  if (containerType === 'parallel') {
    return (
      <ContainerItem>
        {children}
        <LineContainer>
          <LineElement />
        </LineContainer>
      </ContainerItem>
    );
  } else {
    return (
      <ForeachContainer>
        <ForeachItem>
          {children}
          <LineContainer>
            <LineElement mode="long" />
          </LineContainer>
        </ForeachItem>
      </ForeachContainer>
    );
  }
};

const LineElement: React.FC<{ mode?: 'short' | 'long' }> = ({ mode = 'short' }) => (
  <svg viewBox={`0 0 30 ${mode === 'short' ? 32 : 35}`} xmlns="http://www.w3.org/2000/svg">
    <line strokeWidth="3" x1="15" y1="2" x2="15" y2={`${mode === 'short' ? 32 : 35}`} stroke="#c0c0c0" />
  </svg>
);

const DAGRenderingContainer = styled.div<{ showFullscreen: boolean }>`
  margin: 0 -45px;
  overflow-x: ${(p) => (p.showFullscreen ? 'visible' : 'hidden')};
  font-family: monospace;
  font-size: 14px;
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
  border: 2px solid
    ${(p) =>
      p.state === 'ok'
        ? p.theme.notification.success.text
        : p.state === 'running'
        ? p.theme.notification.warning.text
        : p.state === 'warning'
        ? 'gray'
        : 'gray'};
  padding: 0.75rem 1.5rem;
  position: relative;
  border-radius: 4px;
  transition: 0.15s border;
  background: #fff;
  cursor: pointer;
`;

const NormalItemChildContainer = styled.div`
  margin-top: 15px;
`;

const BaseContainerStyle = css`
  border: 2px dashed #c0c0c0;
  background: rgba(192, 192, 192, 0.1);
  display: flex;
  margin: 15px;
  border-radius: 4px;
  position: relative;
  z-index: 1;
`;

const ContainerItem = styled.div`
  ${BaseContainerStyle}
`;

const ForeachContainer = styled.div`
  ${BaseContainerStyle}
  background: rgba(192, 192, 192, 0.3);
  transform: translateX(-5px) translateY(-5px);
  margin-top: 19px;
`;

const ForeachItem = styled.div`
  ${BaseContainerStyle}
  background: #f8f8f8;
  margin: 0;
  transform: translateX(5px) translateY(5px);
  flex: 1;
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
