import React, { useState, useRef } from 'react';

import { DAGModel, convertDAGModelToTree, DAGStructureTree, DAGTreeNode, StepTree } from './DAGUtils';
import { Run, Step } from '../../types';
import styled, { css } from 'styled-components';
import Button from '../Button';
import { ItemRow } from '../Structure';
import useResource from '../../hooks/useResource';
import { useHistory } from 'react-router-dom';
import { getPath } from '../../utils/routing';
import Notification, { NotificationType } from '../Notification';
import FullPageContainer from '../FullPageContainer';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import useComponentSize from '@rehooks/component-size';
import useWindowSize from '../../hooks/useWindowSize';

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
  const _container = useRef(null);
  const ContainerSize = useComponentSize(_container);
  const WindowSize = useWindowSize();

  const { data: stepData } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: true,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  useResource<DAGModel, DAGModel>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/dag`),
    subscribeToEvents: false,
    initialData: null,
    onUpdate: (data) => {
      setDagTree(convertDAGModelToTree(data));
    },
  });

  const [showFullscreen, setFullscreen] = useState(false);
  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);

  const content = !!dagTree.length && (
    <DAGRenderingContainer
      showFullscreen={showFullscreen}
      ref={_container}
      style={{
        transform:
          'scale(' +
          (showFullscreen && ContainerSize.width > WindowSize.width ? WindowSize.width / ContainerSize.width : 1) +
          ')',
      }}
    >
      <div style={{ display: 'flex', padding: '1rem' }}>
        <NormalItemContainer isFirst isLast>
          {dagTree.map((elem, index) => (
            <RenderStep
              run={run}
              item={elem}
              key={index}
              isFirst={index === 0}
              isLast={index + 1 === dagTree.length}
              stepIds={stepData ? stepData.map((item) => item.step_name) : []}
            />
          ))}
        </NormalItemContainer>
      </div>
    </DAGRenderingContainer>
  );

  const error_content = !dagTree.length && (
    <div style={{ padding: '0 0 10px 0' }} data-testid="dag-container-Error">
      <Notification type={NotificationType.Danger}>{t('run.dag-not-available')}</Notification>
    </div>
  );

  const fullscreen_controls = (
    <ItemRow pad="sm" justify="flex-end">
      <Button onClick={() => setFullscreen(true)} withIcon>
        <Icon name="maximize" />
        <span>{t('run.show-fullscreen')}</span>
      </Button>
    </ItemRow>
  );

  return (
    <div style={{ width: '100%' }}>
      {error_content ? error_content : fullscreen_controls}
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
  isFirst?: boolean;
  isLast?: boolean;
  inContainer?: boolean;
  stepIds: string[];
  run: Run;
}> = ({ item, isFirst, isLast, stepIds, run }) => {
  const history = useHistory();
  if (item.node_type === 'normal') {
    const stepState = stateOfStep(item, stepIds);

    return (
      <NormalItemContainer className="itemcontainer" isFirst={isFirst} isLast={isLast}>
        <NormalItem
          state={stepState}
          onClick={() => {
            history.push(getPath.step(run.flow_id, run.run_number, item.step_name));
          }}
        >
          {item.step_name}
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
    return <ContainerItem>{children}</ContainerItem>;
  } else {
    return (
      <ForeachContainer>
        <ForeachItem>{children}</ForeachItem>
      </ForeachContainer>
    );
  }
};

const DAGRenderingContainer = styled.div<{ showFullscreen: boolean }>`
  margin: ${(p) => (p.showFullscreen ? '0' : '0 -45px')};
  overflow-x: ${(p) => (p.showFullscreen ? 'visible' : 'scroll')};
  font-family: monospace;
  font-size: 14px;
`;

const NormalItemContainer = styled.div<{ isRoot?: boolean; isFirst?: boolean; isLast?: boolean }>`
  padding: ${(p) => (p.isRoot ? '0 1rem' : '1rem')};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
  position: relative;

  padding-top: ${(p) => (p.isFirst ? '0' : '1rem')};
  padding-bottom: ${(p) => (p.isLast ? '0' : '1rem')};

  &::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: #c0c0c0;
    left: 50%;
  }
`;

const NormalItem = styled.div<{ state: 'ok' | 'running' | 'warning' }>`
  border: 1px solid
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
  border: 1px solid #c0c0c0;
  background: #f9f9f9;
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

export default DAGContainer;
