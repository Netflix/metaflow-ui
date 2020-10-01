import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import WS from 'jest-websocket-mock';
import { mockfetch } from './utils/testing';

beforeAll(() => {
  global.fetch = mockfetch as any;
});

test('health check', async () => {
  const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });
  render(<App />);

  await server.connected;
});

afterEach(() => {
  WS.clean();
});
