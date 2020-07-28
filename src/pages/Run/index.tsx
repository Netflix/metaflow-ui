import React, { useState, useEffect } from 'react';
import useResource from '../../hooks/useResource';
import { useRouteMatch } from 'react-router-dom';
import { Run as IRun } from '../../types';
import Tabs from '../../components/Tabs';
import { FixedContent } from '../../components/Structure';
import { TimelineContainer } from '../../components/Timeline/VirtualizedTimeline';
import DAG from '../../components/DAG';
import TaskViewContainer from '../Task';
import RunHeader from './RunHeader';
import { getPath } from '../../utils/routing';
import { useTranslation } from 'react-i18next';

const RunPage: React.FC = () => {
  const { t } = useTranslation();
  const { params } = useRouteMatch<{
    flowId: string;
    runNumber: string;
    viewType?: string;
    stepName?: string;
    taskId?: string;
  }>();

  const { data: run } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: true,
    initialData: null,
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('timeline');
  useEffect(() => {
    if (params.viewType) {
      setTab(params.viewType === 'dag' ? 'dag' : 'timeline');
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
    params.stepName && setPreviousStepName(params.stepName);
    params.taskId && setPreviousTaskId(params.taskId);
  }, [params.stepName, params.taskId]);

  return (
    <FixedContent>
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
            component: <TimelineContainer run={run} />,
          },
          {
            key: 'task',
            label: previousTaskId ? `${t('items.task')}: ${previousTaskId}` : `${t('items.task')}`,
            linkTo:
              previousStepName &&
              previousTaskId &&
              getPath.task(params.flowId, params.runNumber, previousStepName, previousTaskId),
            temporary: !!(previousStepName && previousTaskId),
            component: previousStepName && previousTaskId && (
              <TaskViewContainer run={run} stepName={previousStepName} taskId={previousTaskId} />
            ),
          },
        ]}
      />
    </FixedContent>
  );
};

export default RunPage;
