import 'cypress-wait-until';
import 'setimmediate';

import React from 'react';
import { mount } from '@cypress/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import theme from '../../../theme';
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
      <ThemeProvider theme={theme}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ConnectionStatus />
          </QueryParamProvider>
        </Router>
      </ThemeProvider>,
    );

    // check that the connectionStatus is rendered correctly when the connection is ok
    cy.waitUntil(() => connected).then(() => {
      cy.get('[data-testid="connection-status-wrapper"]').children().eq(0).contains('connection.connected');
      cy.get('[data-testid="connection-status-wrapper"]')
        .children()
        .eq(1)
        .should('have.css', 'background-color', 'rgb(32, 175, 46)');

      // check that the connectionStatus is rendered correctly when the connection is closed
      cy.wait(10).then(() => {
        server.close();
        cy.waitUntil(() => !connected).then(() => {
          cy.get('[data-testid="connection-status-wrapper"]')
            .children()
            .eq(0)
            .contains('connection.waiting-for-connection');
          cy.get('[data-testid="connection-status-wrapper"]')
            .children()
            .eq(1)
            .should('have.css', 'background-color', 'rgb(235, 52, 40)');
        });
      });
    });
  });
});
