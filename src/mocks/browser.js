import { HttpResponse, http, ws } from 'msw';
import { setupWorker } from 'msw/browser';

const stantardGetEndpoint = (endpoint, data) => {
  const url = `http://localhost:3000/${endpoint}`;

  return http.get(url, (args) => {
    return HttpResponse.json({
      data: typeof data === 'function' ? data(args) : data,
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

const generateRun = (overrides) => {
  const start = Date.now() - 1000 * 60 * 120 * Math.random();
  const project = [['project:weather', 'project_branch:santeri@outerbounds.co'], []][Math.floor(Math.random() * 2)];
  const status = ['completed', 'running', 'failed'][Math.floor(Math.random() * 3)];

  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    run: 'argo-weather.user.sandels.weatherflow.BasicFlow.' + Math.random(),
    user_name: 'SanteriCM',
    user: Math.random() > 0.5 ? 'SanteriCM' : 'BrendanOB',
    ts_epoch: start,
    finished_at: status === 'running' ? undefined : Date.now(),
    tags: ['testingtag', 'metaflow_version:2.10.0', 'python_version:3.12.7', 'runtime:dev'],
    status: status,
    system_tags: ['user:SanteriCM', ...project],
    ...overrides,
  };
};

const generateRunMetadata = (overrides = {}) => {
  return {
    id: 2341,
    flow_id: 'BasicFlow',
    run_number: 59959,
    run_id: null,
    step_name: 'start',
    task_id: 492813,
    task_name: null,
    attempt_id: 0,
    field_name: 'metadata',
    value: 'default',
    type: 'metadata',
    user_name: 'santeri@outerbounds.co',
    ts_epoch: Date.now() - 3600,
    tags: ['attempt_id:0'],
    system_tags: null,
    ...overrides,
  };
};

const generateStep = (overrides) => {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    run_id: '1',
    step_name: '_parameters',
    user_name: 'santeri@outerbounds.co',
    ts_epoch: Date.now() - 3600,
    duration: 2371,
    tags: [],
    system_tags: ['user:santeri@outerbounds.co', 'metaflow_version:2.12.30.1', 'python_version:3.12.7', 'runtime:dev'],
    ...overrides,
  };
};

const generateTask = (overrides) => {
  return {
    flow_id: 'BasicFlow',
    run_number: 1,
    run_id: null,
    step_name: '_parameters',
    task_id: 520361,
    task_name: null,
    user_name: 'santeri@outerbounds.co',
    status: 'unknown',
    task_ok: ':root:s3',
    ts_epoch: Date.now() - 3600,
    started_at: overrides.ts_epoch || Date.now() - 3600,
    finished_at: Date.now() - 3400,
    duration: 200,
    attempt_id: 0,
    tags: [],
    system_tags: ['user:santeri@outerbounds.co', 'metaflow_version:2.12.30.1', 'python_version:3.12.7', 'runtime:dev'],
    last_heartbeat_ts: Date.now() - 3400,
    ...overrides,
  };
};

export const worker = setupWorker(
  stantardGetEndpoint(
    'api/runs',
    Array.from({ length: 31 }, (_, i) => generateRun({ run_number: i + 1 })),
  ),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid', generateRun()),
  stantardGetEndpoint('api/flows/:flowid/runs/:id/metadata', (args) => [
    generateRunMetadata(),

    args.params.id > 10 &&
      generateRunMetadata({
        field_name: 'execution-triggers',
        value: JSON.stringify(
          [
            { timestamp: 1709280139, id: '7d222e92-83dc-489c-a80e-4711f312dbd0', name: 'test_event', type: 'run' },
            { timestamp: 1709280138, id: '7d222e91-83dc-489c-a80e-4711f312dbd0', name: 'other_event', type: 'event' },
            { timestamp: 1709280137, id: '7d222e90-83dc-489c-a80e-4711f312dbd0', name: 'yahoo', type: 'event' },
          ].slice(0, Math.floor(Math.random() * 3)),
        ),
      }),
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/parameters', {
    parameter_1: { value: 'string value' },
    parameter_2: { value: '{"json_data":{"a":1},"b":5}' },
    parameter_3: { value: 'string value' },
  }),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/artifacts', {}),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps', [
    generateStep({
      step_name: '_parameters',
      ts_epoch: Date.now() - 3600,
      duration: 2371,
    }),
    generateStep({
      step_name: 'start',
      ts_epoch: Date.now() - 3400,
      duration: 99763,
    }),
    generateStep({
      step_name: 'a',
      ts_epoch: Date.now() - 3200,
      duration: null,
    }),
    generateStep({
      step_name: 'end',
      ts_epoch: Date.now(),
      duration: null,
    }),
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/tasks', [
    generateTask({
      step_name: '_parameters',
      status: 'unknown',
      task_id: 520362,
      ts_epoch: Date.now() - 3600,
      finished_at: Date.now() - 3400,
      duration: 200,
      last_heartbeat_ts: Date.now() - 3400,
    }),
    generateTask({
      step_name: 'start',
      status: 'completed',
      task_id: 520363,
      ts_epoch: Date.now() - 3400,
      finished_at: Date.now() - 2000,
      duration: 1400,
      last_heartbeat_ts: Date.now() - 2000,
    }),
    generateTask({
      step_name: 'a',
      status: 'completed',
      task_id: 520364,
      ts_epoch: Date.now() - 2000,
      finished_at: Date.now() - 1700,
      duration: 300,
      last_heartbeat_ts: Date.now() - 1700,
    }),
    generateTask({
      step_name: 'a',
      status: 'completed',
      task_id: 520365,
      ts_epoch: Date.now() - 2500,
      finished_at: Date.now() - 1500,
      duration: 1000,
      last_heartbeat_ts: Date.now() - 1500,
    }),
    generateTask({
      step_name: 'a',
      status: 'completed',
      task_id: 520366,
      ts_epoch: Date.now() - 2000,
      finished_at: Date.now() - 1500,
      duration: 500,
      last_heartbeat_ts: Date.now() - 1500,
    }),
    generateTask({
      step_name: 'a',
      status: 'failed',
      task_id: 520367,
      ts_epoch: Date.now() - 2500,
      finished_at: Date.now() - 1500,
      duration: 1000,
      last_heartbeat_ts: Date.now() - 1500,
    }),
    generateTask({
      step_name: 'end',
      status: 'completed',
      task_id: 520368,
      ts_epoch: Date.now(),
      finished_at: Date.now(),
      duration: 1,
      last_heartbeat_ts: Date.now(),
    }),
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/dag', {
    file: 'second_flow.py',
    parameters: [],
    constants: [],
    steps: {
      start: {
        name: 'start',
        type: 'split-foreach',
        line: 17,
        doc: 'This is the start of the flow',
        decorators: [],
        next: ['a'],
        foreach_artifact: 'indices',
        matching_join: 'join',
      },
      process: {
        name: 'a',
        type: 'linear',
        line: 23,
        doc: '',
        decorators: [],
        next: ['join'],
      },
      join: {
        name: 'join',
        type: 'join',
        line: 30,
        doc: '',
        decorators: [],
        next: ['end'],
      },
      end: {
        name: 'end',
        type: 'end',
        line: 35,
        doc: '',
        decorators: [],
        next: [],
      },
    },
    graph_structure: ['start', [['process']], 'join', 'end'],
    doc: '',
    decorators: [],
    extensions: {},
  }),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps/:stepid/tasks/:taskid/metadata', [
    {
      id: 10926826,
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'start',
      task_id: 492603,
      task_name: null,
      attempt_id: 0,
      field_name: 'attempt',
      value: '0',
      type: 'attempt',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: 1732143950264,
      tags: ['attempt_id:0'],
      system_tags: null,
    },
    {
      id: 10926826,
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'start',
      task_id: 492603,
      task_name: null,
      attempt_id: 0,
      field_name: 'attempt_ok',
      value: 'true',
      type: 'attempt',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: 1732143950264,
      tags: ['attempt_id:0'],
      system_tags: null,
    },
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps/:stepid/tasks/:taskid/logs/out', [
    {
      row: 0,
      timestamp: 1730493994529,
      line: 'Start of std out logs',
    },
    {
      row: 1,
      timestamp: 1730493994529,
      line: 'Log message: Hello world',
    },
    {
      row: 2,
      timestamp: 1730493994529,
      line: 'Log message: Hello world',
    },
    {
      row: 3,
      timestamp: 1730493994529,
      line: 'End of logs',
    },
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps/:stepid/tasks/:taskid/logs/err', [
    {
      row: 0,
      timestamp: 1730493994529,
      line: 'Start of error logs',
    },
    {
      row: 1,
      timestamp: 1730493994529,
      line: 'Critical error in some background system:',
    },
    {
      row: 2,
      timestamp: 1730493994529,
      line: 'Error: 404 Not Found',
    },
    {
      row: 3,
      timestamp: 1730493994529,
      line: 'End of error logs',
    },
  ]),
  rawGetEndpoint('api/plugin', []),
  rawGetEndpoint('api/features', {
    FEATURE_RUN_GROUPS: false,
    // FEATURE_DEBUG_VIEW: true,
    // FEATURE_HIDE_LOGO: true,
    // FEATURE_HIDE_HOME_BUTTON: true,
    // FEATURE_HIDE_STATUS_FILTERS: false,
    // FEATURE_HIDE_TABLE_HEADER: true,
    // FEATURE_HIDE_QUICK_LINKS: true,
    // FEATURE_HIDE_CONNECTION_STATUS: true,
  }),
  stantardGetEndpoint('api/links', []),
  rawGetEndpoint('api/notifications', [
    {
      contentType: 'text',
      created: 1741682750746,
      end: 1741682850746,
      id: 'text_notification',
      message: 'This is a text notification',
      start: 1741682750746,
      type: 'info',
    },
  ]),
  stantardGetEndpoint('api/flows/autocomplete', ['BasicFlow', 'NewFlow', 'VerylooooooooooooooongFlowNaaaaaaaaaaame']),
  http.get('api/tags/autocomplete*', ({ request }) => {
    let response = [];
    if (request.url.includes('tag%3Are=project_branch')) {
      response = ['project_branch:user.whoever', 'project_branch:someone.else'];
    } else if (request.url.includes('tag%3Are=project')) {
      response = ['project:project1', 'project:veryloooooooooooooooooooooooooongprojectnaaaaaaame'];
    } else if (request.url.includes('tag%3Are=user')) {
      response = ['user:santeri@outerbounds.co', 'user:brendan@outerbounds.co'];
    } else if (request.url.includes('tag%3Aco=')) {
      response = ['highlight', 'metaflow_version:2.10.0'];
    }

    return HttpResponse.json({
      data: response,
      status: 200,
      links: {
        self: request.url,
        next: null,
      },
      pages: {
        self: 1,
        first: 1,
        next: null,
        last: null,
      },
    });
  }),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps/:stepid/tasks/:taskid/artifacts', [
    {
      run_number: 1,
      step_name: 'string',
      task_id: 1,
      name: 'string',
      location: 'string',
      ds_type: 'string',
      sha: 'string',
      type: 'string',
      content_type: 'string',
      content: 'string',
      attempt_id: 1,
    },
  ]),
  wsApi.addEventListener('connection', ({ client }) => {
    client.addEventListener('message', (event) => {
      if (event.data === '__ping__') {
        client.send('__pong__');
      }

      try {
        const json = JSON.parse(event.data);
        return;
        if (json.resource?.startsWith('/runs')) {
          setTimeout(() => {
            client.send(
              JSON.stringify({
                type: 'INSERT',
                uuid: json.uuid,
                resource: json.resource,
                data: generateRun({
                  run_number: parseInt(Math.random() * 100),
                  status: 'running',
                  ts_epoch: Date.now(),
                }),
              }),
            );
          }, 2000);
        }
      } catch (e) {}
    });
  }),
);
