import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import Notification, { NotificationType } from '../../components/Notification';
import { Run as IRun } from '../../types';
import ResourceBar from '../../components/ResourceBar';
import Tabs from '../../components/Tabs';
import { Content, FixedContent, Layout } from '../../components/Structure';
import { TimelineContainer } from '../../components/Timeline/VirtualizedTimeline';
import DAG from '../../experiment/DAG';
import { getPath } from '../../utils/routing';

const RunPage: React.FC = () => {
  const { params } = useRouteMatch<{ flowId: string; runNumber: string; viewType: string }>();

  const { data: run, error } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: `/flows/${params.flowId}/runs/${params.runNumber}`,
    initialData: null,
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('timeline');
  useEffect(() => {
    if (params.viewType) {
      setTab(params.viewType === 'dag' ? 'dag' : 'timeline');
    }
  }, [params.viewType]);

  return (
    <FixedContent>
      <ResourceBar>
        <div>
          {run && run.run_number ? (
            <div>
              {run.run_number}, {!run.status ? 'Running' : run.status}
            </div>
          ) : (
            'No run data'
          )}
        </div>
        {error && <Notification type={NotificationType.Danger}>Error loading run: {error}</Notification>}
      </ResourceBar>

      <Tabs
        activeTab={tab}
        tabs={[
          {
            key: 'dag',
            label: 'DAG',
            linkTo: getPath.dag(params.flowId, params.runNumber),
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
            linkTo: getPath.run(params.flowId, params.runNumber),
            component: <TimelineContainer run={run} />,
          },
        ]}
      />
    </FixedContent>
  );
};

export default RunPage;
