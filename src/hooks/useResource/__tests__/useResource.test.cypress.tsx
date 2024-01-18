import React from 'react';
import useResource, { HookConfig } from '..';
import { Server } from 'mock-websocket';
import { mount } from '@cypress/react';
import { gid } from '../../../utils/testing';
import 'setimmediate';

type BasicReponseData = { id: string; label: string };

const BasicResponse = {
  data: [
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
  ],
  status: 200,
  links: {
    self: 'http://localhost/test',
    first: 'http://localhost/test&_page=1',
    prev: 'http://localhost/test&_page=1',
    next: 'http://localhost/test&_page=1',
    last: 'http://localhost/test&_page=1',
  },
  pages: { self: 1, first: 1, prev: 1, next: 1, last: 1 },
  query: { _order: '+ts_epoch', _limit: '1000' },
};

const emptyArray: BasicReponseData[] = [];

const ResourceListComponent = (useResourceSettings: Partial<HookConfig<BasicReponseData[], BasicReponseData>>) => {
  const { data } = useResource<BasicReponseData[], BasicReponseData>({
    url: 'string',
    wsUrl: 'ws://localhost/api/ws',
    initialData: emptyArray,
    ...useResourceSettings,
  });

  return (
    <div data-testid="container">
      {data && Array.isArray(data) ? <div data-testid="result">{data.map((item) => item.label)}</div> : 'nothing here'}
    </div>
  );
};

const ResourceObjectComponent = (useResourceSettings: Partial<HookConfig<BasicReponseData, BasicReponseData>>) => {
  const { data } = useResource<BasicReponseData, BasicReponseData>({
    url: 'other',
    wsUrl: 'ws://localhost/api/ws',
    initialData: null,
    ...useResourceSettings,
  });

  return <div data-testid="container">{data ? <div data-testid="result">{data.label}</div> : 'nothing here'}</div>;
};

describe('useResource hook', () => {
  let server: Server;
  let connected = false;

  before(() => {
    server = new Server(`ws://${window.location.host}/api/ws`);
    server.on('connection', () => {
      connected = true;
    });
  });

  beforeEach(() => {
    cy.intercept('/api/string*', { statusCode: 200, body: BasicResponse });
    cy.intercept('/api/other*', { statusCode: 200, body: { ...BasicResponse, data: { id: '1', label: 'testLabel' } } });
  });

  //
  // Without subscribeToEvents hook should just fetch data initially
  //
  it('useResource - Basic fetch', () => {
    mount(<ResourceListComponent />);
    cy.waitUntil(() => connected, {}).then(() => {
      // Check that content was fetched
      gid('container').contains('123');

      // Send update from websocket...
      server.send(
        JSON.stringify({
          type: 'INSERT',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '4', label: '4' },
        }),
      );
      // ...which should not update to view because subscribeToEvents is false by default
      gid('container').contains('123');
    });
  });

  //
  // Real time updates from websockets by automatically triggering hook update (data prop in component)
  //
  it('useResource - Real time automatic update (Array)', () => {
    mount(
      <ResourceListComponent
        uuid="resourceHookTest"
        subscribeToEvents={true}
        updatePredicate={(a: BasicReponseData, b: BasicReponseData) => a.id === b.id}
      />,
    );

    gid('container').contains('123');
    cy.wait(10).then(() => {
      server.send(
        JSON.stringify({
          type: 'INSERT',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '4', label: '4' },
        }),
      );
      // Websocket update, new entry, should appear on view
      gid('container').contains('4123');

      cy.wait(10).then(() => {
        server.send(
          JSON.stringify({
            type: 'UPDATE',
            uuid: 'resourceHookTest',
            resource: '/string',
            data: { id: '2', label: '5' },
          }),
        );
        // Websocket update, updating old, should appear on view
        gid('container').contains('4153');
      });
    });
  });

  //
  // When using onUpdate parameter, websocket updates wont trigger new render on host component.
  // Also these updates do not have any logic for INSERT or UPDATE so onUpdate function must
  // Handle that separately
  //
  it('useResource - Real time, controlled update (Array)', () => {
    const mockfn = cy.stub();
    mount(<ResourceListComponent uuid="resourceHookTest" subscribeToEvents={true} onUpdate={mockfn} />);
    gid('result').should('be.empty');

    cy.wait(10).then(() => {
      server.send(
        JSON.stringify({
          type: 'INSERT',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '4', label: '4' },
        }),
      );
      // Websocket update should not appear on view...
      gid('result').should('be.empty');
      // ...but onUpdate should have been called with the data
      expect(mockfn).to.have.been.calledWith([{ id: '4', label: '4' }]);

      cy.wait(10).then(() => {
        server.send(
          JSON.stringify({
            type: 'UPDATE',
            uuid: 'resourceHookTest',
            resource: '/string',
            data: { id: '3', label: '500' },
          }),
        );
        // Websocket update should not appear on view...
        gid('result').should('be.empty');
        // ...but onUpdate should have been called with the data
        expect(mockfn).to.have.been.calledWith([{ id: '3', label: '500' }]);
      });
    });
  });

  //
  // When useBatching is given, hook will only call onUpdate function every 500ms. This is done to keep performance decent
  // on some situation
  //
  it('useResource - Real time, controlled batch update (Array)', () => {
    const mockfn = cy.stub();
    mount(
      <ResourceListComponent uuid="resourceHookTest" subscribeToEvents={true} onUpdate={mockfn} useBatching={true} />,
    );
    // Have to wait for batching to happen
    cy.wait(1000).then(() => {
      gid('result').should('be.empty');
      expect(mockfn).to.have.been.calledWith(
        [
          { id: '1', label: '1' },
          { id: '2', label: '2' },
          { id: '3', label: '3' },
        ],
        BasicResponse,
      );
      // Send few messages in row
      server.send(
        JSON.stringify({
          type: 'INSERT',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '4', label: '4' },
        }),
      );
      server.send(
        JSON.stringify({
          type: 'INSERT',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '5', label: '5' },
        }),
      );
      // Have to wait for batching to happen
      cy.wait(1000).then(() => {
        // Websocket update should not appear on view...
        gid('result').should('be.empty');

        // ...but onUpdate should have been called with the all data
        expect(mockfn).to.have.been.calledWith([
          { id: '4', label: '4' },
          { id: '5', label: '5' },
        ]);
      });
    });
  });

  //
  // With Object type
  //

  it('useResource - Real time automatic update (Object)', () => {
    mount(<ResourceObjectComponent uuid="resourceHookTest" initialData={null} subscribeToEvents={true} />);
    // Should have label given in initial request
    gid('result').contains('testLabel');

    cy.wait(10).then(() => {
      server.send(
        JSON.stringify({
          type: 'UPDATE',
          uuid: 'resourceHookTest',
          resource: '/string',
          data: { id: '1', label: 'updatedTestLabel' },
        }),
      );
      // Websocket update, new entry, should appear on view
      gid('result').contains('updatedTestLabel');
    });
  });
});
