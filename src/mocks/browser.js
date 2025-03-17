import { HttpResponse, http, ws } from 'msw';
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

const generateRun = (overrides) => ({
  flow_id: 'BasicFlow',
  run_number: 1,
  user_name: 'SanteriCM',
  user: Math.random() > 0.5 ? 'SanteriCM' : 'BrendanOB',
  ts_epoch: 1595574762958,
  tags: ['testingtag'],
  status: 'completed',
  system_tags: ['user:SanteriCM'],
  ...overrides,
});

export const worker = setupWorker(
  stantardGetEndpoint(
    'api/runs',
    Array.from({ length: 31 }, (_, i) => generateRun({ run_number: i + 1 })),
  ),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid', {
    flow_id: 'BasicFlow',
    run_number: 1,
    user_name: 'SanteriCM',
    user: 'SanteriCM',
    ts_epoch: Date.now() - 3600,
    tags: ['testingtag'],
    status: 'running',
    system_tags: ['user:SanteriCM', 'Another_tag', 'Hello world'],
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
      ts_epoch: Date.now() - 3600,
      tags: ['attempt_id:0'],
      system_tags: null,
    },
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/parameters', {
    parameter_1: { value: 'string value' },
    parameter_2: { value: '{"json_data":{"a":1},"b":5}' },
    parameter_3: { value: 'string value' },
  }),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/artifacts', {}),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/steps', [
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: '1',
      step_name: '_parameters',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: Date.now() - 3600,
      duration: 2371,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: '1',
      step_name: 'start',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: Date.now() - 3400,
      duration: 99763,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
    },
    {
      flow_id: 'BasicFlow',
      run_number: 60690,
      run_id: '60690',
      step_name: 'a',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: Date.now() - 3200,
      duration: null,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
    },
    {
      flow_id: 'BasicFlow',
      run_number: 60690,
      run_id: '60690',
      step_name: 'end',
      user_name: 'santeri@outerbounds.co',
      ts_epoch: Date.now(),
      duration: null,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
    },
  ]),
  stantardGetEndpoint('api/flows/:flowid/runs/:runid/tasks', [
    {
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
      started_at: null,
      finished_at: Date.now() - 3400,
      duration: 200,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390473,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'start',
      task_id: 520362,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'completed',
      task_ok: null,
      ts_epoch: 1739390476078,
      started_at: Date.now() - 3400,
      finished_at: Date.now() - 2000,
      duration: 1400,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390574,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'a',
      task_id: 520363,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'completed',
      task_ok: null,
      ts_epoch: 1739390587807,
      started_at: Date.now() - 2000,
      finished_at: Date.now() - 1700,
      duration: 300,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390730,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'a',
      task_id: 520364,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'completed',
      task_ok: null,
      ts_epoch: 1739390588764,
      started_at: Date.now() - 2500,
      finished_at: Date.now() - 1500,
      duration: 1000,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390728,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'a',
      task_id: 520365,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'completed',
      task_ok: null,
      ts_epoch: 1739390589738,
      started_at: Date.now() - 2000,
      finished_at: Date.now() - 2000,
      duration: 0,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390721,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'a',
      task_id: 520366,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'failed',
      task_ok: null,
      ts_epoch: 1739390590523,
      started_at: Date.now() - 2500,
      finished_at: Date.now() - 2000,
      duration: 500,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390738,
    },
    {
      flow_id: 'BasicFlow',
      run_number: 1,
      run_id: null,
      step_name: 'end',
      task_id: 520369,
      task_name: null,
      user_name: 'santeri@outerbounds.co',
      status: 'running',
      task_ok: null,
      ts_epoch: 1739390828154,
      started_at: Date.now(),
      finished_at: null,
      duration: 871,
      attempt_id: 0,
      tags: [],
      system_tags: [
        'user:santeri@outerbounds.co',
        'metaflow_version:2.12.30.1',
        'python_version:3.12.7',
        'runtime:dev',
      ],
      last_heartbeat_ts: 1739390842,
    },
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
        doc: '',
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
    FEATURE_RUN_GROUPS: true,
    // FEATURE_DEBUG_VIEW: true,
    // FEATURE_HIDE_LOGO: true,
    // FEATURE_HIDE_HOME_BUTTON: true,
    // FEATURE_HIDE_STATUS_FILTERS: false,
    // FEATURE_HIDE_TABLE_HEADER: true,
    // FEATURE_HIDE_QUICK_LINKS: true,
    FEATURE_ARTIFACT_SEARCH: true,
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
  stantardGetEndpoint('api/flows/autocomplete', ['BasicFlow', 'NewFlow']),
  http.get('api/tags/autocomplete*', ({ request }) => {
    let response = [];
    console.log(request.url);
    if (request.url.includes('tag%3Are=project_branch')) {
      response = ['project_branch:user.whoever', 'project_branch:someone.else'];
    } else if (request.url.includes('tag%3Are=project')) {
      response = ['project:project1', 'project:project2'];
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
