import React from 'react';
import Home from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import WS from 'jest-websocket-mock';

describe('Home page', () => {
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
