import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Collapsable from '../Collapsable';
import Icon from '../Icon';

import { pluginPath, PluginsContext, RegisteredPlugin } from './PluginManager';
import PluginSlot from './PluginSlot';

//
// Typedef
//

type Props = {
  id: string;
  title: string;
  slot: string;
};

const VALID_CONTAINERS = ['collapsable', 'titled-container'];

//
// Renders list of plugin to iframe in collapsable element.
//

const PluginGroup: React.FC<Props> = ({ id, slot }) => {
  const [removed, setRemoved] = useState<string[]>([]);
  const { getPluginsBySlot } = useContext(PluginsContext);
  const plugins = getPluginsBySlot(slot).filter((item) => removed.indexOf(item.manifest.name) === -1);
  if (plugins.length === 0) {
    return null;
  }
  return (
    <>
      {plugins
        .sort((a, b) => (a.manifest.name < b.manifest.name ? -1 : 1))
        .map((item) => (
          <div key={item.manifest.name + id} style={{ display: item.settings.visible ? 'block' : 'none' }}>
            <PluginContainer plugin={item}>
              <PluginSlot
                id={id}
                title={item.manifest.name}
                url={pluginPath(item.manifest)}
                onRemove={() => setRemoved((st) => [...st, item.manifest.name])}
                plugin={item}
              />
            </PluginContainer>
          </div>
        ))}
    </>
  );
};

function isCollapsableContainer(container: string | undefined) {
  return !container || container === 'collapsable' || VALID_CONTAINERS.indexOf(container) === -1;
}

const PluginContainer: React.FC<{ plugin: RegisteredPlugin }> = ({ plugin, children }) => {
  const props = plugin.settings.containerProps || {};
  if (isCollapsableContainer(plugin.settings.container)) {
    return (
      <Collapsable {...props} title={<PluginHeaderSection name={plugin.manifest.name} />}>
        {children}
      </Collapsable>
    );
  }

  if (plugin.settings.container === 'titled-container') {
    return (
      <div>
        <PluginHeaderSection name={plugin.manifest.name} />
        <div>{children}</div>
      </div>
    );
  }

  return <>{children}</>;
};

const PluginHeaderSection: React.FC<{ name: string }> = ({ name }) => (
  <PluginHeader>
    <Icon name="plugin" />
    {name}
  </PluginHeader>
);

//
// Style
//

export const PluginHeader = styled.div`
  i {
    margin-right: 0.375rem;
  }

  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5rem;

  svg path {
    fill: #333;
  }
`;

export default PluginGroup;
