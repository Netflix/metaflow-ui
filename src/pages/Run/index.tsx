import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import { Run as IRun } from '../../types';
import Tabs from '../../components/Tabs';
import { Content, FixedContent, Layout } from '../../components/Structure';
import { TimelineContainer } from '../../components/Timeline/VirtualizedTimeline';
import DAG from '../../components/DAG';
import RunHeader from './RunHeader';
import { getPath } from '../../utils/routing';

const RunPage: React.FC = () => {
  const { params } = useRouteMatch<{ flowId: string; runNumber: string; viewType: string }>();

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
    }
  }, [params.viewType]);

  return (
    <FixedContent>
      <RunHeader run={run} />

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
                  <DAG run={run} />
                </Content>
              </Layout>
            ),
          },
          {
            key: 'timeline',
            label: 'Timeline',
            linkTo: getPath.timeline(params.flowId, params.runNumber),
            component: <TimelineContainer run={run} />,
          },
        ]}
      />
    </FixedContent>
  );
};

export default RunPage;
