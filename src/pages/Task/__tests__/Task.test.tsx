import React from 'react';
import Task from '..';
import { render } from '@testing-library/react';
import TestWrapper, { mockfetch } from '../../../utils/testing';
import { Run } from '../../../types';
import WS from 'jest-websocket-mock';

const run: Run = {
  flow_id: 'string',
  user_name: 'string',
  ts_epoch: 123,
  tags: [],
  system_tags: [],
  run_number: '123',
  status: 'completed',
};

describe('Task page', () => {
  beforeAll(() => {
    global.fetch = mockfetch as any;
  });

  test('<Task /> - health check', async () => {
    const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });

    render(
      <TestWrapper>
        <Task run={run} stepName="test" taskId="test" rowData={{}} />
      </TestWrapper>,
    );

    await server.connected;
  });

  afterEach(() => {
    WS.clean();
  });
});
