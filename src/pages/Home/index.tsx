import React from 'react';
import { Link } from 'react-router-dom';
import { Run as IRun } from '../../types';
import Table from '../../components/Table';
import { Layout, Sidebar, Content } from '../../components/Structure';

import useResource from '../../hooks/useResource';
import Notification, { NotificationType } from '../../components/Notification';

const Home: React.FC = () => {
  const { data: runs, error } = useResource<IRun[]>({
    url: `/runs`,
    initialData: [],
    subscribeToEvents: '/runs',
    queryParams: { _group: 'flow_id', _limit: 5, _order: '+flow_id,run_number' },
  });

  return (
    <div>
      <Layout>
        <Sidebar className="sidebar">
          <h3>Filters here</h3>
          {error && <Notification type={NotificationType.Danger}>Error loading run: {error}</Notification>}
        </Sidebar>

        <Content>
          <Table
            data={runs}
            noHeader
            columns={[
              {
                key: 'flow_id',
                label: 'Flow',
                renderer: (item) => (
                  <>
                    <div>
                      {item.flow_id}/{item.run_number}
                    </div>
                    <div>{item.user_name}</div>
                  </>
                ),
              },
              {
                key: 'ts_epoch',
                label: 'Time',
                renderer: (item) => (
                  <>
                    <div>{new Date(item.ts_epoch).toISOString()}</div>
                    <div>Run time here</div>
                  </>
                ),
              },
              { key: 'flow_id', label: 'Errors', renderer: () => <>Possible errors here</> },
              {
                key: 'flow_id',
                label: 'Actions',
                renderer: (item) => (
                  <div style={{ display: 'flex' }}>
                    <Link to={`flows/${item.flow_id}/runs/${item.run_number}/timeline`}>Timeline</Link>
                  </div>
                ),
              },
            ]}
          />
        </Content>
      </Layout>
    </div>
  );
};

export default Home;
