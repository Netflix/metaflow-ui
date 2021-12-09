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
import { render } from 'react-dom';

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

  function componentForStructure(elem: StepStructureModel, index: number) {
    if (Array.isArray(elem)) {
      // we are in a nested step, unnest first.
      // if first step is another split, we are in a parallel split
      // otherwise check if first step is of type foreach
      const tail = elem.slice(1);
      // if first step is string, we should render immediately with children instead of recursively calling further.
      if (!Array.isArray(elem[0]) && !!tail.length) {
        const dataItem = graphData.steps_info[elem[0]];
        return (
          <RenderStep
            step_name={elem[0]}
            run={run}
            item={dataItem}
            key={index}
            isFirst={index === 0}
            isLast={index + 1 === graphData.steps_structure.length}
            stepData={stepData}
          >
            {tail.map((child, index) => componentForStructure(child, index))}
          </RenderStep>
        );
      } else {
        const type =
          Array.isArray(elem[0]) &&
          Array.isArray(elem[0][0]) &&
          !Array.isArray(elem[0][0][0]) &&
          graphData.steps_info[elem[0][0][0]].type === 'foreach'
            ? 'foreach'
            : 'parallel';
        return (
          <ContainerElement containerType={type}>
            {elem.map((elem, index) => componentForStructure(elem, index))}
          </ContainerElement>
        );
      }
    }
    // return component for single step
    const dataItem = graphData.steps_info[elem];
    return (
      <RenderStep
        step_name={elem}
        run={run}
        item={dataItem}
        key={index}
        isFirst={index === 0}
        isLast={index + 1 === graphData.steps_structure.length}
        stepData={stepData}
      />
    );
  }
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
          {graphData.steps_structure.map((elem, index) => componentForStructure(elem, index))}
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
