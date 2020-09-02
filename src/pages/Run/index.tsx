import React, { useState, useEffect } from 'react';
import useResource from '../../hooks/useResource';
import { useRouteMatch } from 'react-router-dom';
import { Run as IRun, Step, Task } from '../../types';
import Tabs from '../../components/Tabs';
import { FixedContent } from '../../components/Structure';
import { TimelineContainer } from '../../components/Timeline/VirtualizedTimeline';
import DAG from '../../components/DAG';
import TaskViewContainer from '../Task';
import RunHeader from './RunHeader';
import { getPath } from '../../utils/routing';
import { useTranslation } from 'react-i18next';
import useRowData from '../../components/Timeline/useRowData';
import Spinner from '../../components/Spinner';

const RunPage: React.FC = () => {
  const { t } = useTranslation();
  const { params } = useRouteMatch<{
    flowId: string;
    runNumber: string;
    viewType?: string;
    stepName?: string;
    taskId?: string;
  }>();

  const { data: run, status } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: true,
    initialData: null,
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
  useResource<Task[], Task>({
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

  useEffect(() => {
    // Move this to run page
    dispatch({ type: 'reset' });
  }, [params.runNumber, dispatch]);

  return (
    <FixedContent>
      {status === 'Loading' && (
        <div style={{ textAlign: 'center' }}>
          <Spinner />
        </div>
      )}

      {status === 'Ok' && run && !run.run_number && t('timeline.no-run-data')}

      {run && run.run_number && (
        <>
          <RunHeader run={run} />
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
                component: <TimelineContainer run={run} rowData={rows} rowDataDispatch={dispatch} />,
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
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </FixedContent>
  );
};

export default RunPage;
