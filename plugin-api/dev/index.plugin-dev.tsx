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
      slot: 'task-details',
      container: 'titled-container',
    },
    identifier: 'id123',
    files: ['index.html'],
  },
];

// Mock data as you need for your plugin. This data will be available in plugin with Metaflow.subscribe(['key-here'], callback)
const DATA = {
  metadata: {
    field: 'value',
    is_plugin_test: 'true',
  },
};

describe('Testing', () => {
  beforeEach(() => {
    cy.intercept('/api/plugin', PLUGIN_DEFINITIONS);
  });

  it('test', () => {
    mount(<PluginDevEnvironment slot="task-details" data={DATA} />);
  });
});
