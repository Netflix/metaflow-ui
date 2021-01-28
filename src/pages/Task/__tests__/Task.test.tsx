import React from 'react';
import Task from '..';
import { render } from '@testing-library/react';
import TestWrapper, { mockfetch } from '../../../utils/testing';
import { Run } from '../../../types';
import WS from 'jest-websocket-mock';
import useGraph from '../../../components/Timeline/useGraph';
import useSeachField from '../../../hooks/useSearchField';

const run: Run = {
  flow_id: 'string',
  user_name: 'string',
  user: 'string',
  ts_epoch: 123,
  tags: [],
  system_tags: [],
  run_number: 123,
  status: 'completed',
};

describe('Task page', () => {
  beforeAll(() => {
    global.fetch = mockfetch as any;
  });

  test('<Task /> - health check', async () => {
    const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });

    const Component = () => {
      const graph = useGraph(0, 1000, false);
      const searchField = useSeachField('asd', '0');
      return (
        <TestWrapper>
          <Task
            run={run}
            stepName="test"
            taskId="test"
            rows={[]}
            rowDataDispatch={(_action) => null}
            graph={graph}
            searchField={searchField}
            paramsString=""
            isAnyGroupOpen={true}
            counts={{ all: 0, completed: 0, failed: 0, running: 0 }}
          />
        </TestWrapper>
      );
    };

    render(<Component />);

    await server.connected;
  });

  afterEach(() => {
    WS.clean();
  });
});
