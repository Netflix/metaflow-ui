import React from 'react';
import { mount } from '@cypress/react';
import PluginDevEnvironment from './PluginDevEnvironment';

//
// Mocked data for plugin.
//

// Plugin definition can be defined here in development phase. When its time to deploy, 
// definition.config should live in manifest.json in plugin folder.
const PLUGIN_DEFINITIONS = [
  {
    name: 'dev-plugin',
    repository: null,
    ref: null,
    parameters: {},
    config: {
      name: 'Development Plugin',
      version: '0.0.1',
      entrypoint: 'index.html',
    },
    identifier: 'id123',
    files: ['index.html'],
  },
]

// Mock data as you need for your plugin. This data will be available in plugin with Metaflow.subscribe(['key-here'], callback)
const DATA = {
  appinfo: {
    commit: 'abcdwfg',
    release_version: '0.17.1',
    service_version: '2.0.5',
    env: 'development',
  },

  run: {
    flow_id: 'PluginDevFlow',
    user_name: 'dev-user',
    ts_epoch: 1634036924920,
    tags: [],
    system_tags: ['metaflow-version:1'],
    run_number: 1,
    run_id: '1',
    run: '1',
    status: 'completed',
    user: 'dev-user',
    finished_at: 1634036996077,
    duration: 71157,
  },

  task: {
    flow_id: 'PluginDevFlow',
    user_name: 'dev-user',
    ts_epoch: 1634036924930,
    tags: [],
    system_tags: ['metaflow-version:1'],
    run_number: 1,
    run_id: '1',
    step_name: 'start',
    task_id: 123,
    task_name: '123',
    attempt_id: 0,
    started_at: 1634036924930,
    finished_at: 1634036996077,
    duration: 71147,
    status: 'completed',
  },

  metadata: [
    {
      flow_id: 'PluginDevFlow',
      user_name: 'dev-user',
      ts_epoch: 1634036924920,
      tags: [],
      system_tags: ['metaflow-version:1'],
      id: 1,
      run_number: 1,
      step_name: 'start',
      task_id: '123',
      field_name: 'datafield',
      value: 'value',
      type: 'aws-batch-job-id',
    }
  ],
}

describe('Testing', () => {
  beforeEach(() => {
    cy.intercept('/api/plugin', PLUGIN_DEFINITIONS)
  })

  it('test', () => {
    mount(<PluginDevEnvironment slot='task-details' data={DATA} />);
  })
})
