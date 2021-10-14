import React, { useContext, useEffect } from 'react';
import TestWrapper from '../../src/utils/testing';
import PluginGroup from '../../src/components/Plugins/PluginGroup';
import { PluginsContext, PluginsProvider } from '../../src/components/Plugins/PluginManager';
import PluginRegisterSystem from '../../src/components/Plugins/PluginRegisterSystem';

const PluginDevEnvironment = (props) => {
  return (
    <TestWrapper>
      <PluginsProvider>
        <PluginContent {...props} />
      </PluginsProvider>
    </TestWrapper>
  );
};

const PluginContent = ({ slot = 'task-details', baseurl = 'http://localhost:5000/dev/plugins/', data }) => {
  const { addDataToStore } = useContext(PluginsContext);

  useEffect(() => {
    addDataToStore('appinfo', data.appinfo);
    addDataToStore('run', data.run)
    addDataToStore('task', data.task)
    addDataToStore('metadata', data.metadata)
  }, []);

  // NOTE: You could add some more complex interactions here to test different things like data updates for plugin.
  // functions `addDataToStore` and `callEvent` from plugin contexts are useful for interacting with plugin.

  return (
    <>
      <PluginGroup id="dev-group" title="Plugin dev environment" slot={slot} baseurl={baseurl} />
      <PluginRegisterSystem baseurl={baseurl} />
    </>
  );
};

export default PluginDevEnvironment;
