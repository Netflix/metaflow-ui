import React from 'react';
import Run from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import WS from 'jest-websocket-mock';
import { createRun } from '../../../utils/testhelper';

describe('Run page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify(createRun({})));
  });

  test('<Run /> - health check', async () => {
    const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });
    render(
      <TestWrapper>
        <Run />
      </TestWrapper>,
    );
    await server.connected;
  });

  afterEach(() => {
    WS.clean();
  });
});
