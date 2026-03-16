import useComponentSize, { ComponentSize } from '@rehooks/component-size';
import React, { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Run, TaskStatus, Task, Metadata } from '@/types';
import { DAGModelItem, DAGNodeTypes, GraphModel, GraphStructureModel } from '@components/DAG/DAGUtils';
import Icon from '@components/Icon';
import { StepLineData } from '@components/Timeline/taskdataUtils';
import { RowDataModel, StepRowData } from '@components/Timeline/useTaskData';
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
  tasks: RowDataModel;
  metadata: Metadata[];
  isExpanded: boolean;
};

type DAGModelItemWithStatus = DAGModelItem & { status: TaskStatus };
type StepInfoModelWithStatus = Record<string, DAGModelItemWithStatus>;

const DAGContent: React.FC<DAGContentProps> = ({
  showFullscreen,
  graphData,
  run,
  stepData,
  tasks,
  metadata,
  isExpanded,
}) => {
  const _measureRef = useRef(null);
  const size = useComponentSize(_measureRef);
  const windowSize = useWindowSize();
  const history = useHistory();

  const stepsWithStatus: StepInfoModelWithStatus = useMemo(() => {
    return Object.keys(graphData.steps).reduce((obj, key) => {
      const step = graphData.steps[key];
      const addedStatus = {
        ...step,
        status: stepData.find((sd) => sd.step_name === step.name)?.status || ('unknown' as const),
      };

      return {
        ...obj,
        [key]: addedStatus,
      };
    }, {});
  }, [graphData.steps, stepData]);

  function goToStep(stepName: string) {
    history.push(getPath.step(run.flow_id, getRunId(run), stepName));
  }

  const taskMetadata = useMemo(() => {
    return metadata.reduce(
      (acc, m) => {
        if (!m.task_id) return acc;
        if (!acc[m.task_id]) acc[m.task_id] = {};
        acc[m.task_id][m.field_name] = m.value;
        return acc;
      },
      {} as Record<string, Record<string, string>>,
    );
  }, [metadata]);

  const scale = getGraphScale(showFullscreen, size, windowSize);

  return (
    <OuterContainer showFullscreen={showFullscreen}>
      <DAGRenderingContainer
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div ref={_measureRef} style={{ display: 'inline-block', minWidth: '100%' }}>
          <ElementContainer variant="root" lined={false}>
            <DAGBranch
              steps={stepsWithStatus}
              structure={graphData.graph_structure}
              goToStep={goToStep}
              tasks={tasks}
              taskMetadata={taskMetadata}
              isExpanded={isExpanded}
              run={run}
            />
          </ElementContainer>
        </div>
      </DAGRenderingContainer>
    </OuterContainer>
  );
};

type DAGBranchProps = {
  steps: StepInfoModelWithStatus;
  structure: Array<GraphStructureModel>;
  goToStep: (step: string) => void;
  tasks: RowDataModel;
  taskMetadata: Record<string, Record<string, string>>;
  isExpanded: boolean;
  run: Run;
};

const DAGBranch: React.FC<DAGBranchProps> = ({ steps, structure, goToStep, tasks, taskMetadata, isExpanded, run }) => {
  return (
    <ElementContainer variant="root" lined={false}>
      {structure.map((branch, index) => {
        const item =
          typeof branch === 'string' ? (
            <DAGItem
              key={branch}
              step={steps[branch]}
              goToStep={goToStep}
              tasks={tasks ? tasks[steps[branch]?.name] : undefined}
              taskMetadata={taskMetadata}
              isExpanded={isExpanded}
              run={run}
            />
          ) : (
            <DAGContainerItem
              key={index}
              type={
                typeof structure[index - 1] === 'string'
                  ? getSplitContainerType(steps[structure[index - 1] as string]?.type)
                  : 'split-static'
              }
              steps={steps}
              branch={branch}
              goToStep={goToStep}
              tasks={tasks}
              taskMetadata={taskMetadata}
              isExpanded={isExpanded}
              run={run}
            />
          );

        return (
          <React.Fragment key={index}>
            {index > 0 && <VerticalConnector />}
            {item}
          </React.Fragment>
        );
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
  tasks: RowDataModel;
  taskMetadata: Record<string, Record<string, string>>;
  isExpanded: boolean;
  run: Run;
};

const DAGContainerItem: React.FC<DAGContainerItemProps> = ({
  steps,
  type,
  branch,
  goToStep,
  tasks,
  taskMetadata,
  isExpanded,
  run,
}) => {
  const content = Array.isArray(branch) ? (
    branch.map((b, index) => (
      <DAGBranch
        key={`branch-${index}`}
        steps={steps}
        structure={b as GraphStructureModel[]}
        goToStep={goToStep}
        tasks={tasks}
        taskMetadata={taskMetadata}
        isExpanded={isExpanded}
        run={run}
      />
    ))
  ) : (
    <DAGBranch
      steps={steps}
      structure={branch}
      goToStep={goToStep}
      tasks={tasks}
      taskMetadata={taskMetadata}
      isExpanded={isExpanded}
      run={run}
    />
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
  tasks?: StepRowData;
  taskMetadata: Record<string, Record<string, string>>;
  isExpanded: boolean;
  run: Run;
};

const DAGItem: React.FC<DAGItemProps> = ({ step, goToStep, tasks, taskMetadata, isExpanded, run }) => {
  const history = useHistory();

  const taskList: Task[] = useMemo(() => {
    if (!tasks) return [];
    return Object.values(tasks.data)
      .flat()
      .sort((a, b) => a.task_id - b.task_id);
  }, [tasks]);

  const shouldExpand = isExpanded && taskList.length > 0;

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
        isExpanded={shouldExpand}
      >
        <StepName>{step.name}</StepName>
        {step.doc && <DocstringTooltip stepName={step.name} docs={step.doc} />}
        {shouldExpand && (
          <TaskGridWrapper onClick={(e) => e.stopPropagation()}>
            <TaskGrid>
              {taskList.map((task) => {
                const meta = taskMetadata[task.task_id];
                const foreachValue = meta?.['foreach-stack'];

                return (
                  <TaskCardWrapper key={task.task_id}>
                    <TaskCard
                      state={task.status}
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(getPath.task(run.flow_id, getRunId(run), step.name, task.task_id.toString()));
                      }}
                      title={foreachValue ? `Task ${task.task_id} (${foreachValue})` : `Task ${task.task_id}`}
                    />
                    {foreachValue && <TaskLabel>{foreachValue}</TaskLabel>}
                  </TaskCardWrapper>
                );
              })}
            </TaskGrid>
          </TaskGridWrapper>
        )}
      </NormalItem>
    </ElementContainer>
  );
};

function getGraphScale(
  showFullscreen: boolean,
  currentSize: ComponentSize,
  windowSize: { height: number; width: number },
) {
  if (!showFullscreen || !currentSize.width || !currentSize.height) {
    return 1;
  }
  const horizontalPadding = 48;
  const verticalPadding = 140;

  const widthScale = (windowSize.width - horizontalPadding) / currentSize.width;
  const heightScale = (windowSize.height - verticalPadding) / currentSize.height;

  const minScale = Math.min(widthScale, heightScale);

  return minScale > 1 ? 1 : minScale;
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
const OuterContainer = styled.div<{ showFullscreen: boolean }>`
  height: 100%;
  width: 100%;
  overflow: ${(p) => (p.showFullscreen ? 'hidden' : 'auto')};
  position: relative;
`;

const DAGRenderingContainer = styled.div`
  display: flex;
  justify-content: center;
  transition: transform 0.2s ease-out;
  font-size: 0.75rem;
  min-height: 100%;
`;

const VerticalConnector = styled.div`
  width: 1px;
  height: 2rem;
  background: var(--color-border-primary);
  margin: -1rem 0;
  z-index: 1;
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
  z-index: 1;
  width: auto;
  min-width: 100%;
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
      ? 'var(--color-success-bg)'
      : p.state === 'running'
        ? 'var(--color-warning-bg)'
        : p.state === 'failed'
          ? 'var(--color-danger-bg)'
          : 'var(--color-bg-primary)'};
`;

const NormalItem = styled.div<{ state: TaskStatus; isExpanded: boolean }>`
  ${StatusColorStyles}
  padding: ${(p) => (p.isExpanded ? '0.75rem' : '0.75rem 1.5rem')};
  min-width: ${(p) => (p.isExpanded ? '14rem' : '8rem')};

  position: relative;
  z-index: 10;
  border-radius: var(--radius-primary);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  isolation: isolate;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    background-color: #ffffff;
  }
`;

const StepName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-primary);
`;

const TaskGridWrapper = styled.div`
  width: 100%;
  margin-top: 0.5rem;
`;

const TaskGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  width: 100%;
  justify-content: center;
`;

const TaskCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const TaskCard = styled.div<{ state: TaskStatus }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: ${(p) =>
    p.state === 'completed'
      ? 'var(--color-text-success)'
      : p.state === 'running'
        ? 'var(--color-text-warning)'
        : p.state === 'failed'
          ? 'var(--color-text-danger)'
          : 'var(--color-bg-secondary)'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.2) translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
`;

const TaskLabel = styled.span`
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BaseContainerStyle = css`
  border: var(--border-thin-2);
  background: var(--color-bg-primary);
  display: flex;
  border-radius: var(--radius-secondary);
  position: relative;
  z-index: 10;
`;

const ContainerItem = styled.div`
  ${BaseContainerStyle}
  box-shadow: 0.35rem 0.35rem 0 rgba(0, 0, 0, 0.04);
  background: var(--color-bg-primary);
`;

const ForeachContainer = styled.div`
  ${BaseContainerStyle}
  background: var(--color-bg-neutral);
  transform: translateX(-0.35rem) translateY(-0.35rem);
  margin-top: 0.25rem;
  box-shadow: 0.35rem 0.35rem 0 rgba(0, 0, 0, 0.04);
  z-index: 5;
  isolation: isolate;
`;

const ForeachItem = styled.div`
  ${BaseContainerStyle}
  background: var(--color-bg-primary);
  margin: 0;
  transform: translateX(0.35rem) translateY(0.35rem);
  flex: 1;
`;

const StepInfoMarker = styled.div`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;

  path {
    fill: var(--color-text-light);
  }

  &:hover path {
    fill: var(--color-text-primary);
  }
`;

export default DAGContent;
