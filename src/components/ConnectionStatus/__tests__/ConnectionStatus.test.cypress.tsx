import 'cypress-wait-until';
import 'setimmediate';

import React from 'react';
import { mount } from '@cypress/react';
import TestWrapper from '../../../utils/testing';
import ConnectionStatus from '..';
import { Server } from 'mock-websocket';

describe('ConnectionStatus test', () => {
  let server: Server;
  let connected = false;

  before(() => {
    server = new Server(`ws://${window.location.host}/api/ws`);
    server.on('connection', () => {
      connected = true;
    });
    server.on('close', () => {
      connected = false;
    });
  });

  it('ConnectionStatus basic', () => {
    cy.viewport(1000, 600);

    mount(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>,
    );

    // check that the connectionStatus is rendered correctly when the connection is ok
    cy.waitUntil(() => connected).then(() => {
      cy.get('[data-testid="Connected"]');

      // check that the connectionStatus is rendered correctly when the connection is closed
      cy.wait(10).then(() => {
        server.close();
        cy.waitUntil(() => !connected).then(() => {
          cy.get('[data-testid="Disconnected"]');
        });
      });
    });
  });
});
