import React from 'react';
import useResource from '..';
import { render, waitFor } from '@testing-library/react';
import WS from 'jest-websocket-mock';

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

const ResourceListComponent = (useResourceSettings: any) => {
  const { data } = useResource<BasicReponseData[], BasicReponseData>({
    url: 'string',
    initialData: [],
    ...useResourceSettings,
  });

  return (
    <div data-testid="container">
      {data && Array.isArray(data) ? <div data-testid="result">{data.map((item) => item.label)}</div> : 'nothing here'}
    </div>
  );
};

const ResourceObjectComponent = (useResourceSettings: any) => {
  const { data } = useResource<BasicReponseData, BasicReponseData>({
    url: 'string',
    initialData: null,
    ...useResourceSettings,
  });

  return <div data-testid="container">{data ? <div data-testid="result">{data.label}</div> : 'nothing here'}</div>;
};

describe('useResource hook', () => {
  const server = new WS('ws://localhost/api/ws', { jsonProtocol: true });
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(BasicResponse),
      }),
    ) as any;
  });

  //
  // Without subscribeToEvents hook should just fetch data initially
  //
  test('useResource - Basic fetch', async () => {
    const { getByTestId } = render(<ResourceListComponent />);
    // Check that content was fetched
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    // Send update from websocket...
    await server.connected;
    server.send({
      type: 'INSERT',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '4', label: '4' },
    });
    // ...which should not update to view
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
  });

  //
  // Real time updates from websockets by automatically triggering hook update (data prop in component)
  //
  test('useResource - Real time automatic update (Array)', async () => {
    const { getByTestId } = render(
      <ResourceListComponent
        uuid="resourceHookTest"
        subscribeToEvents={true}
        updatePredicate={(a: BasicReponseData, b: BasicReponseData) => a.id === b.id}
      />,
    );
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    await server.connected;

    server.send({
      type: 'INSERT',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '4', label: '4' },
    });
    // Websocket update, new entry, should appear on view
    await waitFor(() => expect(getByTestId('container').textContent).toBe('4123'));

    server.send({
      type: 'UPDATE',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '2', label: '5' },
    });
    // Websocket update, updating old, should appear on view
    await waitFor(() => expect(getByTestId('container').textContent).toBe('4153'));
  });

  //
  // When using onUpdate parameter, websocket updates wont trigger new render on host component.
  // Also these updates do not have any logic for INSERT or UPDATE so onUpdate function must
  // Handle that separately
  //
  test('useResource - Real time, controlled update (Array)', async () => {
    const mockfn = jest.fn();
    const { getByTestId } = render(
      <ResourceListComponent uuid="resourceHookTest" subscribeToEvents={true} onUpdate={mockfn} />,
    );
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    await server.connected;

    server.send({
      type: 'INSERT',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '4', label: '4' },
    });
    // Websocket update should not appear on view...
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    // ...but onUpdate should have been called with the data
    expect(mockfn).toHaveBeenLastCalledWith([{ id: '4', label: '4' }]);

    server.send({
      type: 'UPDATE',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '3', label: '500' },
    });
    // Websocket update should not appear on view...
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    // ...but onUpdate should have been called with the data
    expect(mockfn).toHaveBeenLastCalledWith([{ id: '3', label: '500' }]);
  });

  //
  // When useBatching is given, hook will only call onUpdate function every 500ms. This is done to keep performance decent
  // on some situation
  //
  test('useResource - Real time, controlled batch update (Array)', async () => {
    const mockfn = jest.fn();
    const { getByTestId } = render(
      <ResourceListComponent uuid="resourceHookTest" subscribeToEvents={true} onUpdate={mockfn} useBatching={true} />,
    );
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    await server.connected;
    // Send few messages in row
    server.send({
      type: 'INSERT',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '4', label: '4' },
    });
    server.send({
      type: 'INSERT',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '5', label: '5' },
    });
    // Websocket update should not appear on view...
    await waitFor(() => expect(getByTestId('container').textContent).toBe('123'));
    // ...but onUpdate should have been called with the all data
    await waitFor(() =>
      expect(mockfn).toHaveBeenLastCalledWith([
        { id: '4', label: '4' },
        { id: '5', label: '5' },
      ]),
    );
  });

  //
  // With Object type
  //

  test('useResource - Real time automatic update (Object)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ...BasicResponse, data: { id: '1', label: 'testLabel' } }),
      }),
    ) as any;
    const { getByTestId } = render(
      <ResourceObjectComponent uuid="resourceHookTest" initialData={null} subscribeToEvents={true} />,
    );
    // Should have label given in initial request
    await waitFor(() => expect(getByTestId('result').textContent).toBe('testLabel'));
    await server.connected;

    server.send({
      type: 'UPDATE',
      uuid: 'resourceHookTest',
      resource: '/string',
      data: { id: '1', label: 'updatedTestLabel' },
    });
    // Websocket update, new entry, should appear on view
    await waitFor(() => expect(getByTestId('result').textContent).toBe('updatedTestLabel'));
  });
});
