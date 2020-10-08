import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import useRowData from '../../components/Timeline/useRowData';
import { getPath } from '../../utils/routing';
import { Run as IRun, Step, Task, RunParam } from '../../types';

import TaskViewContainer from '../Task';
import Spinner from '../../components/Spinner';
import GenericError from '../../components/GenericError';
import Tabs from '../../components/Tabs';
import { FixedContent, ItemRow } from '../../components/Structure';
import RunHeader from './RunHeader';
import DAG from '../../components/DAG';
import Timeline from '../../components/Timeline/VirtualizedTimeline';

type RunPageParams = {
  flowId: string;
  runNumber: string;
  viewType?: string;
  stepName?: string;
  taskId?: string;
};

const RunContainer: React.FC = () => {
  const { t } = useTranslation();
  const { params } = useRouteMatch<RunPageParams>();

  const { data: run, status, error } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: true,
    initialData: null,
  });

  return (
    <FixedContent>
      {status === 'Loading' && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Spinner md />
        </div>
      )}

      {status === 'Error' && error && (
        <ItemRow margin="lg">
          <GenericError message={t('timeline.no-run-data')} />
        </ItemRow>
      )}

      {status === 'Ok' && run && run.run_number && <RunPage run={run} params={params} />}
    </FixedContent>
  );
};

type RunPageProps = {
  run: IRun;
  params: RunPageParams;
};

const RunPage: React.FC<RunPageProps> = ({ run, params }) => {
  const { t } = useTranslation();

  const { data: runParameters } = useResource<RunParam, RunParam>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}/parameters`,
    subscribeToEvents: true,
    initialData: {},
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('timeline');
  useEffect(() => {
    if (params.viewType && ['dag', 'timeline', 'task'].indexOf(params.viewType) > -1) {
      setTab(params.viewType);
    } else if (params.stepName && params.taskId) {
      setTab('task');
    }
  }, [params.viewType, params.stepName, params.taskId]);

  const [previousStepName, setPreviousStepName] = useState<string>();
  const [previousTaskId, setPreviousTaskId] = useState<string>();

  useEffect(() => {
    setPreviousStepName(undefined);
    setPreviousTaskId(undefined);
  }, [params.runNumber]);

  useEffect(() => {
    params.stepName && params.stepName !== 'not-selected' && setPreviousStepName(params.stepName);
    params.taskId && params.stepName !== 'not-selected' && setPreviousTaskId(params.taskId);
  }, [params.stepName, params.taskId]);

  //
  // Step & Task data
  //

  const { rows, dispatch } = useRowData();

  // Fetch & subscribe to steps
  useResource<Step[], Step>({
    url: encodeURI(`/flows/${params.flowId}/runs/${params.runNumber}/steps`),
    subscribeToEvents: true,
    initialData: [],
    onUpdate: (items) => {
      dispatch({ type: 'fillStep', data: items });
    },
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fullyDisableCache: true,
  });

  // Fetch & subscribe to tasks
  const { status: taskStatus } = useResource<Task[], Task>({
    url: encodeURI(`/flows/${params.flowId}/runs/${params.runNumber}/tasks`),
    subscribeToEvents: true,
    initialData: [],
    updatePredicate: (a, b) => a.task_id === b.task_id,
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
    fetchAllData: true,
    onUpdate: (items) => {
      dispatch({ type: 'fillTasks', data: items });
    },
    fullyDisableCache: true,
    useBatching: true,
  });

  //
  // Graph measurements and rendering logic
  //

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [params.runNumber, dispatch]);

  //
  // Store gourpping state here. TODO: Figure out where it should live
  //

  const [groupByStep, setGroupByStep] = useState(true);

  return (
    <>
      <RunHeader run={run} parameters={runParameters} />
      <Tabs
        widen
        activeTab={tab}
        tabs={[
          {
            key: 'dag',
            label: t('run.DAG'),
            linkTo: getPath.dag(params.flowId, params.runNumber),
            component: <DAG run={run} />,
          },
          {
            key: 'timeline',
            label: t('run.timeline'),
            linkTo: getPath.timeline(params.flowId, params.runNumber),
            component: (
              <Timeline
                run={run}
                rowData={rows}
                rowDataDispatch={dispatch}
                status={taskStatus}
                groupBy={{ value: groupByStep, set: setGroupByStep }}
              />
            ),
          },
          {
            key: 'task',
            label: previousTaskId ? `${t('items.task')}: ${previousTaskId}` : `${t('items.task')}`,
            linkTo:
              (previousStepName &&
                previousTaskId &&
                getPath.task(params.flowId, params.runNumber, previousStepName, previousTaskId)) ||
              getPath.tasks(params.flowId, params.runNumber),
            temporary: !!(previousStepName && previousTaskId),
            component: (
              <TaskViewContainer
                run={run}
                stepName={previousStepName || 'not-selected'}
                taskId={previousTaskId || 'not-selected'}
                rowData={rows}
                rowDataDispatch={dispatch}
                groupBy={{ value: groupByStep, set: setGroupByStep }}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default RunContainer;
