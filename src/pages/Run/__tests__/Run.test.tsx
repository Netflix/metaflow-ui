import React from 'react';
import Run from '..';
import { render } from '@testing-library/react';
import TestWrapper, { mockfetch } from '../../../utils/testing';
import WS from 'jest-websocket-mock';

describe('Run page', () => {
  beforeAll(() => {
    global.fetch = mockfetch as any;
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
