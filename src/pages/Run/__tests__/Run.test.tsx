import React from 'react';
import Run from '..';
import { render } from '@testing-library/react';
import TestWrapper from '../../../utils/testing';
import WS from 'jest-websocket-mock';

describe('Run page', () => {
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
