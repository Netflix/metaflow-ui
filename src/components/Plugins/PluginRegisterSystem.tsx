import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiHttp } from '../../constants';
import { PluginCommuncationsAPI, PluginManifest, pluginPath, PluginsContext } from './PluginManager';

//
// Plugin register system will add iframes to DOM until it gets register message
// from plugin. Here we can filter out plugins that doesnt work or does not register properly.
//

const PluginRegisterSystem: React.FC<{ baseurl?: string }> = ({ baseurl }) => {
  const [definitions, setDefinitions] = useState<PluginManifest[]>([]);
  const { plugins, register } = useContext(PluginsContext);

  useEffect(() => {
    // Fetch Plugin definitions
    fetch(apiHttp('/plugin'))
      .then((response) => {
        return response.json();
      })
      .then((plugins: PluginManifest[]) => {
        setDefinitions(plugins);
      })
      .catch((e) => console.log(e));
  }, []); // eslint-disable-line

  const messageListener = useCallback(
    (event: MessageEvent) => {
      const msg = PluginCommuncationsAPI.isRegisterMessage(event);
      if (msg) {
        const definition = definitions.find((item) => item.name === msg.name);
        if (definition) {
          // Register plugin to specific slot
          register(
            {
              slot: msg.slot,
              visible: typeof msg.visible === 'boolean' ? (msg.visibile as boolean) : true,
              container: typeof msg.container === 'string' ? msg.container : 'collapsable',
              containerProps:
                msg.containerProps && typeof msg.containerProps === 'object'
                  ? (msg.containerProps as Record<string, unknown>)
                  : undefined,
            },
            definition,
            msg.version,
          );
        }
      }
    },
    [definitions, register],
  );

  useEffect(() => {
    // Start listening to register messages from plugin iframes
    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  }, [messageListener]);

  // Filter out already registered plugin so their iframes will be destroyed.
  const registeredPlugins = plugins.map((item) => item.manifest.name);
  const toRegister = definitions.filter((item) => registeredPlugins.indexOf(item.name) === -1);

  return (
    <HidingElement>
      {toRegister.map((plg) => (
        <iframe
          key={plg.identifier}
          height="0"
          width="0"
          name={plg.name}
          title={plg.name}
          src={pluginPath(plg, baseurl)}
          sandbox="allow-scripts"
        />
      ))}
    </HidingElement>
  );
};

export const HidingElement = styled.div`
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 99999px;
`;

export default PluginRegisterSystem;
