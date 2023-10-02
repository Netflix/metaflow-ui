import React from 'react';
import PluginGroup from './PluginGroup';

// Component to hold the plugin for the `top-nav` slot
const TopNavPlugin: React.FC = () => {
  return <PluginGroup id="top-nav" title="Extensions" slot="top-nav" />;
};

export default TopNavPlugin;
