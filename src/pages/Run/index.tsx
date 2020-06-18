import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import Notification, { NotificationType } from '../../components/Notification';
import { Run as IRun, Step as IStep } from '../../types';
import ResourceBar from '../../components/ResourceBar';
import Tabs from '../../components/Tabs';
import { Content, Layout } from '../../components/Structure';
import VirtualizedTimeline from '../../experiment/VirtualizedTimeline';
import DAG from '../../experiment/DAG';

export default function RunPage() {
  const { url, params } = useRouteMatch<{ flowId: string; runNumber: string; viewType: string }>();
  const urlBase = url.split('/').slice(0, -1).join('/');
  const { data: run, error } = useResource<IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    initialData: null,
  });

  // TODO: Each tab should fetch their own resources. This way we can also leverage React.Suspense in the future
  const stepsResource = useResource<IStep[]>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}/steps`,
    initialData: [],
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('dag');
  useEffect(() => {
    if (params.viewType) {
      setTab(params.viewType);
    }
  }, [params]);

  return (
    <>
      <ResourceBar>
        {run?.run_number}
        {error && <Notification type={NotificationType.Danger}>Error loading run: {error}</Notification>}
      </ResourceBar>

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
                  <DAG steps={stepsResource.data} />
                </Content>
              </Layout>
            ),
          },
          {
            key: 'timeline',
            label: 'Timeline',
            linkTo: `${urlBase}/timeline`,
            component: (
              <Layout>
                <Content>
                  <VirtualizedTimeline data={stepsResource.data} onOpen={() => null} />
                </Content>
              </Layout>
            ),
          },
        ]}
      />
    </>
  );
}
