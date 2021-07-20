import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Collapsable from '../Collapsable';
import Icon from '../Icon';

import { pluginPath, PluginsContext } from './PluginManager';
import PluginSlot from './PluginSlot';

//
// Typedef
//

type Props = {
  id: string;
  title: string;
  slot: string;
};

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
            <Collapsable
              title={
                <PluginHeader>
                  <Icon name="plugin" />
                  {item.manifest.name}
                </PluginHeader>
              }
            >
              <PluginSlot
                id={id}
                title={item.manifest.name}
                url={pluginPath(item.manifest)}
                onRemove={() => setRemoved((st) => [...st, item.manifest.name])}
                pluginDefinition={item.manifest}
              />
            </Collapsable>
          </div>
        ))}
    </>
  );
};

//
// Style
//

export const PluginHeader = styled.div`
  i {
    margin-right: 0.375rem;
  }

  svg path {
    fill: #333;
  }
`;

export default PluginGroup;
