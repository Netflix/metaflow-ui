import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import useComponentSize, { ComponentSize } from '@rehooks/component-size';
import useWindowSize from '../../../hooks/useWindowSize';
import { Run, TaskStatus } from '../../../types';
import { GraphModel, DAGModelItem, StepStructureModel } from '../DAGUtils';
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
  graphData: GraphModel;
  run: Run;
  stepData: StepLineData[];
};

const DAGContent: React.FC<DAGContentProps> = ({ showFullscreen, graphData, run, stepData }) => {
  const _container = useRef(null);
  const ContainerSize = useComponentSize(_container);
  const WindowSize = useWindowSize();

  function StepsFromStructure(structure: Array<StepStructureModel>, nested?: boolean) {
    const components = [];
    for (const [index, step] of structure.entries()) {
      if (Array.isArray(step)) {
        // skip arrays, these are handled by passing next_step recursively.
        continue;
      }
      const dataItem = graphData.steps_info[step];
      const data = graphData.steps_info[step];
      const next_step = structure[index + 1]; // TODO: guard against OOB if needed.
      const type = data.type;
      if (Array.isArray(next_step) && (type === 'foreach' || type === 'split')) {
        // if step is a splitting one, wrap next_step in a suitable container
        // before continuing recursively for the branch
        const wrapped_next_step = (
          <ContainerElement containerType={type}>
            {next_step.map((step) => StepsFromStructure(step, true))}
          </ContainerElement>
        );
        if (nested) {
          components.push(
            <RenderStep
              step_name={step}
              run={run}
              item={dataItem}
              key={index}
              isFirst={false}
              isLast={false}
              stepData={stepData}
            >
              {wrapped_next_step}
            </RenderStep>,
          );
        } else {
          components.push(
            <RenderStep
              step_name={step}
              run={run}
              item={dataItem}
              key={index}
              isFirst={index === 0}
              isLast={index + 1 === structure.length}
              stepData={stepData}
            />,
            wrapped_next_step,
          );
        }
        continue;
      }
      if (nested) {
        // for nested branches, the tail needs to be wrapped as children so break
        // the current iteration and continue recursively.
        const tail = structure.slice(index + 1);
        components.push(
          <RenderStep
            step_name={step}
            run={run}
            item={dataItem}
            key={index}
            isFirst={false}
            isLast={false}
            stepData={stepData}
          >
            {!!tail.length && StepsFromStructure(tail)}
          </RenderStep>,
        );
        break;
      } else {
        components.push(
          <RenderStep
            step_name={step}
            run={run}
            item={dataItem}
            key={index}
            isFirst={index === 0}
            isLast={index + 1 === structure.length}
            stepData={stepData}
          />,
        );
      }
    }
    return components;
  }
  return (
    <DAGRenderingContainer
      showFullscreen={showFullscreen}
      ref={_container}
      style={{
        transform: 'scale(' + getGraphScale(showFullscreen, ContainerSize, WindowSize) + ')',
      }}
    >
      <NormalItemContainer isRoot>{StepsFromStructure(graphData.steps_structure)}</NormalItemContainer>
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
  step_name: string;
  item: DAGModelItem;
  isFirst?: boolean;
  isLast?: boolean;
  stepData: StepLineData[];
  run: Run;
}> = ({ step_name, item, isFirst, isLast, stepData, run, children }) => {
  const history = useHistory();
  const stepState = stateOfStep(step_name, stepData);

  return (
    <NormalItemContainer isFirst={isFirst} isLast={isLast} data-testid="dag-normalitem">
      <NormalItem
        data-testid="dag-normalitem-box"
        state={stepState}
        onClick={() => {
          history.push(getPath.step(run.flow_id, run.run_number, step_name));
        }}
      >
        {step_name}
        {item?.doc && <DocstringTooltip stepName={step_name} docs={item.doc} />}
      </NormalItem>
      {children && (
        <NormalItemChildContainer data-testid="dag-normalitem-children">{children}</NormalItemChildContainer>
      )}
    </NormalItemContainer>
  );
};

export const ContainerElement: React.FC<{ containerType: 'split' | 'foreach' }> = ({ containerType, children }) => {
  if (containerType === 'split') {
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

export function stateOfStep(step_name: string, stepData: StepLineData[]): TaskStatus {
  const data = stepData.find((s) => s.step_name === step_name);

  if (data) {
    return data.status;
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

  ${(p) =>
    p.isRoot
      ? ''
      : css`&::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: #d0d0d0;
    left: 50%;`}}
`;

const StatusColorStyles = css<{ state: TaskStatus }>`
  border: 1px solid
    ${(p) =>
      p.state === 'completed'
        ? p.theme.notification.success.text
        : p.state === 'running'
        ? p.theme.notification.warning.text
        : p.state === 'failed'
        ? p.theme.notification.danger.text
        : p.theme.color.border.mid};
  background: ${(p) =>
    p.state === 'completed'
      ? mix(0.05, p.theme.notification.success.text, '#fff')
      : p.state === 'running'
      ? mix(0.05, p.theme.notification.warning.text, '#fff')
      : p.state === 'failed'
      ? mix(0.05, p.theme.notification.danger.text, '#fff')
      : '#fff'};
`;

const NormalItem = styled.div<{ state: TaskStatus }>`
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
  margin-top: 0.1875rem;
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
