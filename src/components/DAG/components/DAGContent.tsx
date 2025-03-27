import useComponentSize, { ComponentSize } from '@rehooks/component-size';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Run, TaskStatus } from '@/types';
import { DAGModelItem, DAGNodeTypes, GraphModel, GraphStructureModel } from '@components/DAG/DAGUtils';
import Icon from '@components/Icon';
import { StepLineData } from '@components/Timeline/taskdataUtils';
import Tooltip, { TooltipTitle } from '@components/Tooltip';
import useWindowSize from '@hooks/useWindowSize';
import { getPath } from '@utils/routing';
import { getRunId } from '@utils/run';

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
  const history = useHistory();

  const stepsWithStatus: StepInfoModelWithStatus = Object.keys(graphData.steps).reduce((obj, key) => {
    const addedStatus = {
      ...graphData.steps[key],
      status: stepData.find((sd) => sd.step_name === key)?.status || ('unknown' as const),
    };

    return {
      ...obj,
      [key]: addedStatus,
    };
  }, {});

  function goToStep(stepName: string) {
    history.push(getPath.step(run.flow_id, getRunId(run), stepName));
  }

  return (
    <DAGRenderingContainer
      showFullscreen={showFullscreen}
      ref={_container}
      style={{
        transform: 'scale(' + getGraphScale(showFullscreen, ContainerSize, WindowSize) + ')',
      }}
    >
      <ElementContainer variant="root" lined={false}>
        <DAGBranch steps={stepsWithStatus} structure={graphData.graph_structure} goToStep={goToStep} />
      </ElementContainer>
    </DAGRenderingContainer>
  );
};

//
// Takes array of items to render. These branches can be nested since every "branch" of split
// will be new array of nodes
//
type DAGModelItemWithStatus = DAGModelItem & { status: TaskStatus };
type StepInfoModelWithStatus = Record<string, DAGModelItemWithStatus>;

type DAGBranchProps = {
  steps: StepInfoModelWithStatus;
  structure: Array<GraphStructureModel>;
  goToStep: (step: string) => void;
};

const DAGBranch: React.FC<DAGBranchProps> = ({ steps, structure, goToStep }) => {
  return (
    <ElementContainer variant="root" lined={true}>
      {structure.map((branch, index) => {
        if (typeof branch === 'string') {
          return <DAGItem key={branch} step={steps[branch]} goToStep={goToStep} />;
        } else {
          // Because its actually previous step that contains info about the split, we need
          // to check it here.
          const previousStep = index === 0 ? null : structure[index - 1];
          const containerType =
            typeof previousStep === 'string' ? getSplitContainerType(steps[previousStep].type) : 'split-static';

          return (
            <DAGContainerItem key={index} type={containerType} steps={steps} branch={branch} goToStep={goToStep} />
          );
        }
      })}
    </ElementContainer>
  );
};

function getSplitContainerType(previousStepType: DAGNodeTypes) {
  return 'split-foreach' === previousStepType || 'split-parallel' === previousStepType
    ? previousStepType
    : 'split-static';
}

//
// Container renders foreach element or split element
//

type DAGContainerItemProps = {
  steps: StepInfoModelWithStatus;
  type: 'split-static' | 'split-foreach' | 'split-parallel';
  branch: GraphStructureModel[];
  goToStep: (step: string) => void;
};

const DAGContainerItem: React.FC<DAGContainerItemProps> = ({ steps, type, branch, goToStep }) => {
  const content = Array.isArray(branch) ? (
    branch.map((b, index) => (
      <DAGBranch key={`branch-${index}`} steps={steps} structure={b as GraphStructureModel[]} goToStep={goToStep} />
    ))
  ) : (
    <DAGBranch steps={steps} structure={branch} goToStep={goToStep} />
  );

  if (type === 'split-static') {
    return <ContainerItem data-testid="dag-parallel-container">{content}</ContainerItem>;
  } else {
    return (
      <ForeachContainer data-testid="dag-foreach-container">
        <ForeachItem>{content}</ForeachItem>
      </ForeachContainer>
    );
  }
};

//
// Normal DAG node to render.
//

type DAGItemProps = {
  step: DAGModelItemWithStatus;
  goToStep: (step: string) => void;
};

const DAGItem: React.FC<DAGItemProps> = ({ step, goToStep }) => {
  return (
    <ElementContainer
      lined={false}
      variant={step.name === 'start' ? 'first' : step.type === 'end' ? 'last' : 'default'}
      data-testid="dag-normalitem"
    >
      <NormalItem
        data-testid="dag-normalitem-box"
        state={step.status}
        onClick={() => {
          goToStep(step.name);
        }}
      >
        {step.name}
        {step.doc && <DocstringTooltip stepName={step.name} docs={step.doc} />}
      </NormalItem>
    </ElementContainer>
  );
};

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

const DocstringTooltip: React.FC<{ stepName: string; docs: string }> = ({ stepName, docs }) => {
  const { t } = useTranslation();
  return (
    <>
      <StepInfoMarker
        data-tooltip-id={stepName}
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

const Line = css`
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

const ElementContainer = styled.div<{ variant: 'root' | 'first' | 'last' | 'default'; lined: boolean }>`
  padding: 1rem;
  padding-top: ${(p) => (['root', 'first'].includes(p.variant) ? '0' : '1rem')};
  padding-bottom: ${(p) => (['root', 'last'].includes(p.variant) ? '0' : '1rem')};

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
  position: relative;

  width: 100%;

  ${(p) => (p.lined ? Line : '')}
`;

const StatusColorStyles = css<{ state: TaskStatus }>`
  border: 1px solid
    ${(p) =>
      p.state === 'completed'
        ? 'var(--color-text-success)'
        : p.state === 'running'
          ? 'var(--color-text-warning)'
          : p.state === 'failed'
            ? 'var(--color-text-danger)'
            : 'var(--color-border-2)'};
  background: ${(p) =>
    p.state === 'completed'
      ? 'color-mix(in hsl, var(--color-text-success) 5%, #fff)'
      : p.state === 'running'
        ? 'color-mix(in hsl, var(--color-text-warning) 5%, #fff)'
        : p.state === 'failed'
          ? 'color-mix(in hsl, var(--color-text-danger) 5%, #fff)'
          : '#fff'};
`;

const NormalItem = styled.div<{ state: TaskStatus }>`
  ${StatusColorStyles}
  padding: 0.75rem 1.5rem;

  position: relative;
  border-radius: var(--radius-primary);
  transition: 0.15s border;
  cursor: pointer;
`;

const BaseContainerStyle = css`
  border: var(--border-thin-2);
  background: #f6f6f6;
  display: flex;
  border-radius: var(--radius-secondary);
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

export default DAGContent;
