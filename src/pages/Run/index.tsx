import React, { useState, useEffect } from 'react';
import useResource from '../../hooks/useResource';
import { useRouteMatch } from 'react-router-dom';
import { Run as IRun } from '../../types';
import Tabs from '../../components/Tabs';
import { Content, FixedContent, Layout } from '../../components/Structure';
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
            component: (
              <Layout>
                <Content>
                  <DAG run={run} />
                </Content>
              </Layout>
            ),
          },
          {
            key: 'timeline',
            label: t('run.timeline'),
            linkTo: getPath.timeline(params.flowId, params.runNumber),
            component: <TimelineContainer run={run} />,
          },
          ...(params.stepName && params.taskId
            ? [
                {
                  key: 'task',
                  label: `${t('items.task')}: ${params.taskId}`,
                  linkTo: getPath.task(params.flowId, params.runNumber, params.stepName, params.taskId),
                  temporary: true,
                  component: <TaskViewContainer run={run} stepName={params.stepName} taskId={params.taskId} />,
                },
              ]
            : []),
        ]}
      />
    </FixedContent>
  );
};

export default RunPage;
