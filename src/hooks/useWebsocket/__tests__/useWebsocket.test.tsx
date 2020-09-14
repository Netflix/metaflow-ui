import React from 'react';
import useWebsocket from '..';
import { render } from '@testing-library/react';
import WS from 'jest-websocket-mock';

describe('useWebsocket hook', () => {
  test('useWebsocket - health check', async () => {
    const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });
    const updateFunction = jest.fn();
    const WSComponent = () => {
      useWebsocket({
        url: 'test',
        onUpdate: updateFunction,
        uuid: 'test123',
      });

      return <div>WebSocket component</div>;
    };
    render(<WSComponent />);

    // Wait for WS to connet
    await server.connected;
    // Should get unsub message first
    expect(server).toReceiveMessage({ type: 'UNSUBSCRIBE', uuid: 'test123' });
    // After that sub message
    await server.nextMessage;
    expect(server).toReceiveMessage({ type: 'SUBSCRIBE', uuid: 'test123', resource: '/test' });
    // Send data from server
    server.send({ uuid: 'test123', resource: '/test' });
    // Update function in client should get triggered
    expect(updateFunction).toHaveBeenLastCalledWith({ uuid: 'test123', resource: '/test' });

    // Send with different uuid...
    server.send({ uuid: 'test122', resource: '/test-monkey' });
    // ..And last triggered message should be still earlier one
    expect(updateFunction).toHaveBeenLastCalledWith({ uuid: 'test123', resource: '/test' });

    // Send with correct uuid and resource again and update should trigger
    server.send({ uuid: 'test123', resource: '/test', payload: 'YepYep' });
    expect(updateFunction).toHaveBeenLastCalledWith({ uuid: 'test123', resource: '/test', payload: 'YepYep' });
  });
});
