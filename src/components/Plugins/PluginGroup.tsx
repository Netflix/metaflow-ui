import React, { useContext, useState, useMemo, ReactNode } from 'react';
import styled from 'styled-components';
import Collapsable from '../Collapsable';
import Icon from '../Icon';

import { AllowedSlot, pluginPath, PluginsContext, Plugin } from './PluginManager';
import PluginSlot from './PluginSlot';

//
// Typedef
//

type Props = {
  id: string;
  title: string;
  slot: AllowedSlot;
  baseurl?: string;
  // Way to override url params. Used for tests and plugin development
  resourceParams?: Record<string, string>;
};

const VALID_CONTAINERS = ['collapsable', 'titled-container'];

//
// Renders list of plugin to iframe in collapsable element.
//

const PluginGroup: React.FC<Props> = ({ id, slot, baseurl, resourceParams }) => {
  const [removed, setRemoved] = useState<string[]>([]);
  const { getPluginsBySlot } = useContext(PluginsContext);
  const plugins = useMemo(
    () => getPluginsBySlot(slot).filter((item) => removed.indexOf(item.name) === -1),
    [getPluginsBySlot, removed, slot],
  );

  const items = useMemo(() => plugins?.sort((a, b) => (a.name < b.name ? -1 : 1)), [plugins]);

  return (
    <>
      {items.map((item) => (
        <div key={item.name + id} style={{ display: item.config.visible ? 'block' : 'none' }}>
          <PluginContainer plugin={item}>
            <PluginSlot
              id={id}
              title={item.name}
              url={pluginPath(item, baseurl)}
              onRemove={() => setRemoved((st) => [...st, item.name])}
              plugin={item}
              resourceParams={resourceParams}
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

const PluginContainer: React.FC<{ plugin: Plugin; children: ReactNode }> = ({ plugin, children }) => {
  const props = plugin.config.containerProps || {};
  if (isCollapsableContainer(plugin.config.container)) {
    return (
      <Collapsable {...props} title={<PluginHeaderSection name={plugin.config.name} />}>
        {children}
      </Collapsable>
    );
  }

  if (plugin.config.container === 'titled-container') {
    return (
      <div>
        <PluginHeaderSection name={plugin.config.name} />
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
