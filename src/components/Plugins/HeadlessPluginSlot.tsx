import React from 'react';
import PluginGroup from './PluginGroup';
import { HidingElement } from './PluginRegisterSystem';

//
// Headless plugins will not be visible but can contains javascript to do various things.
//

const HeadlessPluginSlot: React.FC = () => {
  return (
    <HidingElement>
      <PluginGroup id="HeadlessPlugin" slot="headless" title="unique-headlesss-title" />
    </HidingElement>
  );
};

export default HeadlessPluginSlot;
