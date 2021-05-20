import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import useComponentSize, { ComponentSize } from '@rehooks/component-size';
import useWindowSize from '../../../hooks/useWindowSize';
import { Run } from '../../../types';
import { DAGStructureTree, DAGTreeNode, StepTree } from '../DAGUtils';
import { useHistory } from 'react-router-dom';
import { getPath } from '../../../utils/routing';
import { StepLineData } from '../../Timeline/taskdataUtils';
import Icon from '../../Icon';
import { useTranslation } from 'react-i18next';
import Tooltip, { TooltipTitle } from '../../Tooltip';
import { mix } from 'polished';
//
// DAG Content section for when we have dag data
//

type DAGContentProps = {
  showFullscreen: boolean;
  dagTree: DAGStructureTree;
  run: Run;
  stepData: StepLineData[];
};

const DAGContent: React.FC<DAGContentProps> = ({ showFullscreen, dagTree, run, stepData }) => {
  const _container = useRef(null);
  const ContainerSize = useComponentSize(_container);
  const WindowSize = useWindowSize();

  const stepIds = stepData.map((item) => item.step_name);
  const failedStepIds = stepData.reduce(
    (arr: string[], item) => (item.status === 'failed' ? arr.concat([item.step_name]) : arr),
    [],
  );

  return (
    <DAGRenderingContainer
      showFullscreen={showFullscreen}
      ref={_container}
      style={{
        transform: 'scale(' + getGraphScale(showFullscreen, ContainerSize, WindowSize) + ')',
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
              stepIds={[stepIds, failedStepIds]}
            />
          ))}
        </NormalItemContainer>
      </div>
    </DAGRenderingContainer>
  );
};

export default DAGContent;

function getGraphScale(
  showFullscreen: boolean,
  ContainerSize: ComponentSize,
  WindowSize: { height: number; width: number },
) {
  if (!showFullscreen) {
    return 1;
  }
  if (ContainerSize.width > WindowSize.width) {
    // Check if height is still too big after scaling with width..
    const newScale = WindowSize.width / ContainerSize.width;
    if (ContainerSize.height * newScale + 96 > WindowSize.height) {
      return (WindowSize.height - 96) / ContainerSize.height;
    }
    return newScale;
  }

  if (ContainerSize.height + 96 > WindowSize.height) {
    return (WindowSize.height - 96) / ContainerSize.height;
  }

  return 1;
}

export const RenderStep: React.FC<{
  item: DAGTreeNode;
  isFirst?: boolean;
  isLast?: boolean;
  inContainer?: boolean;
  stepIds: [string[], string[]];
  run: Run;
}> = ({ item, isFirst, isLast, stepIds, run }) => {
  const history = useHistory();
  if (item.node_type === 'normal') {
    const stepState = stateOfStep(item, stepIds);

    return (
      <NormalItemContainer isFirst={isFirst} isLast={isLast} data-testid="dag-normalitem">
        <NormalItem
          data-testid="dag-normalitem-box"
          state={stepState}
          onClick={() => {
            history.push(getPath.step(run.flow_id, run.run_number, item.step_name));
          }}
        >
          {item.step_name}
          {item.original?.doc && <DocstringTooltip stepName={item.step_name} docs={item.original.doc} />}
        </NormalItem>
        {item.children && item.children.length > 0 && (
          <NormalItemChildContainer data-testid="dag-normalitem-children">
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

export const ContainerElement: React.FC<{ containerType: 'parallel' | 'foreach' }> = ({ containerType, children }) => {
  if (containerType === 'parallel') {
    return <ContainerItem data-testid="dag-parallel-container">{children}</ContainerItem>;
  } else {
    return (
      <ForeachContainer data-testid="dag-foreach-container">
        <ForeachItem>{children}</ForeachItem>
      </ForeachContainer>
    );
  }
};

//
// Find out correct state for a step. Step doesn't have status field so we need to figure it out ourselves
//

type StepBoxStatus = 'ok' | 'running' | 'warning' | 'unknown';

export function stateOfStep(item: StepTree, [stepIds, failedIds]: [string[], string[]]): StepBoxStatus {
  if (stepIds.indexOf(item.step_name) > -1) {
    if (failedIds.indexOf(item.step_name) > -1) {
      return 'warning';
    } else if (item.original && (stepIds.indexOf(item.original.next[0]) > -1 || item.original?.next.length === 0)) {
      return 'ok';
    }
    return 'running';
  }

  return 'unknown';
}

const DocstringTooltip: React.FC<{ stepName: string; docs: string }> = ({ stepName, docs }) => {
  const { t } = useTranslation();
  return (
    <>
      <StepInfoMarker
        data-tip
        data-for={stepName}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Icon name="infoSmall" size="xs" />
        <Tooltip id={stepName}>
          <TooltipTitle>{t('run.developer-comment')}</TooltipTitle>
          {docs}
        </Tooltip>
      </StepInfoMarker>
    </>
  );
};

//
// Style
//

const DAGRenderingContainer = styled.div<{ showFullscreen: boolean }>`
  margin: ${(p) => (p.showFullscreen ? '0' : '0 -2.875px')};
  overflow-x: ${(p) => (p.showFullscreen ? 'visible' : 'auto')};
  overflow-y: visible;
  height: 100%;
  font-size: 0.75rem;
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
  width: 100%;

  &::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: #d0d0d0;
    left: 50%;
  }
`;

const StatusColorStyles = css<{ state: StepBoxStatus }>`
  border: 1px solid
    ${(p) =>
      p.state === 'ok'
        ? p.theme.notification.success.text
        : p.state === 'running'
        ? p.theme.notification.warning.text
        : p.state === 'warning'
        ? p.theme.notification.danger.text
        : p.theme.color.border.mid};
  background: ${(p) =>
    p.state === 'ok'
      ? mix(0.05, p.theme.notification.success.text, '#fff')
      : p.state === 'running'
      ? mix(0.05, p.theme.notification.warning.text, '#fff')
      : p.state === 'warning'
      ? mix(0.05, p.theme.notification.danger.text, '#fff')
      : '#fff'};
`;

const NormalItem = styled.div<{ state: StepBoxStatus }>`
  ${StatusColorStyles}
  padding: 0.75rem 1.5rem;

  position: relative;
  border-radius: 0.25rem;
  transition: 0.15s border;
  cursor: pointer;
`;

const NormalItemChildContainer = styled.div`
  margin-top: 1rem;
`;

const BaseContainerStyle = css`
  border: ${(p) => p.theme.border.thinMid};
  background: #f6f6f6;
  display: flex;
  margin: 1rem;
  border-radius: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ContainerItem = styled.div`
  ${BaseContainerStyle}
`;

const ForeachContainer = styled.div`
  ${BaseContainerStyle}
  background: rgba(192, 192, 192, 0.3);
  transform: translateX(-0.275rem) translateY(-0.275rem);
  margin-top: 1.1875rem;
  &::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: #d0d0d0;
    left: 50%;
  }
`;

const ForeachItem = styled.div`
  ${BaseContainerStyle}
  background: #f6f6f6;
  margin: 0;
  transform: translateX(0.275rem) translateY(0.275rem);
  flex: 1;
`;

const StepInfoMarker = styled.div`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;

  path {
    fill: #717171;
  }

  &:hover path {
    fill: #333;
  }
`;
