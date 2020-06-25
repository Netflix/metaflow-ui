import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import Notification, { NotificationType } from '../../components/Notification';
import { Run as IRun } from '../../types';
import ResourceBar from '../../components/ResourceBar';
import Tabs from '../../components/Tabs';
import { Content, FixedContent, Layout } from '../../components/Structure';
import { TimelineContainer } from '../../experiment/VirtualizedTimeline';
import DAG from '../../experiment/DAG';

export default function RunPage() {
  const { url, params } = useRouteMatch<{ flowId: string; runNumber: string; viewType: string }>();
  const urlBase = url.split('/').slice(0, -1).join('/');
  const { data: run, error } = useResource<IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: `/flows/${params.flowId}/runs/${params.runNumber}`,
    initialData: null,
  });

  console.log(run);

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('dag');
  useEffect(() => {
    if (params.viewType) {
      setTab(params.viewType);
    }
  }, [params]);

  return (
    <FixedContent>
      <ResourceBar>
        {run?.run_number}
        {error && <Notification type={NotificationType.Danger}>Error loading run: {error}</Notification>}
      </ResourceBar>

      <div>{run && run.run_number ? run.run_number : 'No run data'}</div>

      <Tabs
        activeTab={tab}
        tabs={[
          {
            key: 'dag',
            label: 'DAG',
            linkTo: `${urlBase}/dag`,
            component: (
              <Layout>
                <Content>
                  <DAG steps={[]} />
                </Content>
              </Layout>
            ),
          },
          {
            key: 'timeline',
            label: 'Timeline',
            linkTo: `${urlBase}/timeline`,
            component: <TimelineContainer runNumber={params.runNumber} flowId={params.flowId} />,
          },
        ]}
      />
    </FixedContent>
  );
}
