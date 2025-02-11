import { http, HttpResponse, ws } from 'msw';
import { setupWorker } from 'msw/browser';

const stantardGetEndpoint = (endpoint, data) => {
  const url = `http://localhost:3000/${endpoint}`;

  return http.get(url, () => {
    return HttpResponse.json({
      data,
      status: 200,
      links: {
        self: url,
        next: null,
      },
      pages: {
        self: 1,
        first: 1,
        next: null,
        last: null,
      },
    });
  });
};

const rawGetEndpoint = (url, data) => {
  return http.get(url, () => {
    return HttpResponse.json(data);
  });
};

const wsApi = ws.link('ws://localhost:3000/api/ws');

export const worker = setupWorker(
  stantardGetEndpoint('api/runs', [
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      user_name: 'SanteriCM',
      user: 'SanteriCM',
      ts_epoch: 1595574762958,
      tags: ['testingtag'],
      status: 'completed',
      system_tags: ['user:SanteriCM'],
    },
    {
      flow_id: 'BasicFlow',
      run_number: 2,
      user_name: 'SanteriCM',
      user: 'SanteriCM',
      ts_epoch: 1595574763000,
      tags: ['testingtag'],
      status: 'completed',
      system_tags: ['user:SanteriCM'],
    },
    {
      flow_id: 'BasicFlow',
      run_number: 3,
      user_name: 'SanteriCM',
      user: 'SanteriCM',
      ts_epoch: 1595574764000,
      tags: ['testingtag'],
      status: 'completed',
      system_tags: ['user:SanteriCM'],
    },
    {
      flow_id: 'NewFlow',
      run_number: 4,
      user_name: 'SanteriCM',
      user: 'SanteriCM',
      ts_epoch: 1595574764000,
      tags: ['testingtag'],
      status: 'completed',
      system_tags: ['user:SanteriCM'],
    },
    {
      flow_id: 'NewFlow',
      run_number: 5,
      user_name: 'SanteriCM',
      user: 'SanteriCM',
      ts_epoch: 1595574464000,
      tags: ['testingtag'],
      status: 'completed',
      system_tags: ['user:SanteriCM'],
    },
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid', {
    flow_id: 'BasicFlow',
    run_number: 1,
    user_name: 'SanteriCM',
    user: 'SanteriCM',
    ts_epoch: 1595574762958,
    tags: ['testingtag'],
    status: 'completed',
    system_tags: ['user:SanteriCM'],
  }),
  stantardGetEndpoint('api/flows/:flowid/runs/:id/metadata', [
    {
      id: 2341,
      flow_id: 'BasicFlow',
      run_number: 59959,
      run_id: null,
      step_name: 'start',
      task_id: 492813,
      task_name: null,
      attempt_id: 0,
      field_name: 'kubernetes-pod-service-account-name',
      value: 'default',
      type: 'kubernetes-pod-service-account-name',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: 1738118048513,
      tags: ['attempt_id:0'],
      system_tags: null,
    },
  ]),
  rawGetEndpoint('api/plugin', []),
  stantardGetEndpoint('api/links', []),
  stantardGetEndpoint('api/notifications', []),
  wsApi.addEventListener('connection', ({ client }) => {
    client.addEventListener('message', (event) => {
      if (event.data === '__ping__') {
        client.send('__pong__');
      }
    });
  }),
);
