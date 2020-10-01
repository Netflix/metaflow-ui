import React from 'react';
import Home from '..';
import { render } from '@testing-library/react';
import TestWrapper, { mockfetch } from '../../../utils/testing';
import WS from 'jest-websocket-mock';

describe('Home page', () => {
  beforeAll(() => {
    global.fetch = mockfetch as any;
  });

  test('<Home /> - health check', async () => {
    const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>,
    );

    await server.connected;
  });

  afterEach(() => {
    WS.clean();
  });
});
