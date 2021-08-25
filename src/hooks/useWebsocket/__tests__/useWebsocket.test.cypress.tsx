import React, { useState } from 'react';
import useWebsocket from '..';

import { Server } from 'mock-websocket';
import { mount } from '@cypress/react';

describe('useWebsocket hook', () => {
  let server: Server;
  let connected = false;

  before(() => {
    server = new Server(`ws://${window.location.host}/api/ws`);
    server.on('connection', () => {
      connected = true;
    });
  });

  it('useWebsocket - health check', async () => {
    const WSComponent = () => {
      const [msg, setMsg] = useState({
        data: 'empty',
        uuid: 'empty',
        resource: 'empty',
        type: 'empty',
      });

      useWebsocket({
        url: 'test',
        onUpdate: (data) => setMsg(data as any),
        uuid: 'test123',
      });

      return (
        <div>
          <div id="data">{msg.data}</div>
          <div id="uuid">{msg.uuid}</div>
          <div id="resource">{msg.resource}</div>
          <div id="type">{msg.type}</div>
        </div>
      );
    };

    mount(<WSComponent />);

    cy.waitUntil(() => connected).then(() => {
      server.send(JSON.stringify({ uuid: 'test123', resource: '/test', data: 'Hello' }));
      // Component should update
      cy.get('#uuid').contains('test123');
      cy.get('#resource').contains('/test');
      cy.get('#data').contains('Hello');

      cy.wait(10).then(() => {
        // Component should not update due wrong uuid
        server.send(JSON.stringify({ uuid: 'test122', resource: '/test', data: 'Terve' }));
        cy.get('#data').contains('Hello');

        cy.wait(10).then(() => {
          // Update component when uuid matches
          server.send(JSON.stringify({ uuid: 'test123', resource: '/test', data: 'YepYep' }));
          cy.get('#data').contains('YepYep');
        });
      });
    });
  });
});
