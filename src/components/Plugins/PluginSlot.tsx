import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PLUGIN_STYLESHEET from './PluginDefaultStyleSheet';
import { PluginCommuncationsAPI, MESSAGE_NAME, PluginsContext, RegisteredPlugin } from './PluginManager';

//
// Typedef
//

type Props = {
  id: string;
  url: string;
  title: string;
  onRemove?: () => void;
  plugin: RegisteredPlugin;
};

//
// Renders single plugin to iframe. Also handles communications with plugin
//

const PluginSlot: React.FC<Props> = ({ id, url, title, plugin }) => {
  const [height, setHeight] = useState(150);
  const _iframe = useRef<HTMLIFrameElement>(null);
  const { subscribeToDatastore, unsubscribeFromDatastore, subscribeToEvent, callEvent, unsubscribeFromEvent } =
    useContext(PluginsContext);
  const VERY_UNIQUE_ID = id + title + url;
  //
  // Subscribe to messages from iframe
  //
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (PluginCommuncationsAPI.isRegisterMessage(e) && e.data.name === title) {
        const w = _iframe.current?.contentWindow;
        if (w) {
          w.postMessage({ type: 'ReadyToRender', config: plugin.manifest }, '*');
          if (plugin.settings.useApplicationStyles) {
            const iframeContent = _iframe?.current?.contentDocument;
            if (iframeContent) {
              iframeContent.head.innerHTML = `<style>${PLUGIN_STYLESHEET}</style>` + iframeContent.head.innerHTML;
            }
          }
        } else {
          console.log('Register message happened when iframe wasnt ready');
        }
      }
      if (PluginCommuncationsAPI.isPluginMessage(e, title)) {
        switch (e.data.type) {
          case MESSAGE_NAME.SUBSCRIBE_DATA: {
            if (!e.data.paths) return;
            if (Array.isArray(e.data.paths)) {
              for (const path of e.data.paths) {
                subscribeToDatastore(VERY_UNIQUE_ID, path, (data) => {
                  _iframe.current?.contentWindow?.postMessage({ type: 'DataUpdate', path: path, data }, '*');
                });
              }
            } else {
              subscribeToDatastore(VERY_UNIQUE_ID, e.data.paths, (data) => {
                _iframe.current?.contentWindow?.postMessage({ type: 'DataUpdate', path: e.data.paths, data }, '*');
              });
            }
            return;
          }
          case MESSAGE_NAME.SUBSCRIBE_EVENT: {
            if (!e.data.events) return;
            if (Array.isArray(e.data.events)) {
              for (const event of e.data.events) {
                subscribeToEvent(VERY_UNIQUE_ID, event, (data) => {
                  _iframe.current?.contentWindow?.postMessage({ type: 'EventUpdate', event: event, data }, '*');
                });
              }
            } else {
              subscribeToEvent(VERY_UNIQUE_ID, e.data.events, (data) => {
                _iframe.current?.contentWindow?.postMessage({ type: 'EventUpdate', event: e.data.events, data }, '*');
              });
            }
            return;
          }
          case MESSAGE_NAME.CALL_EVENT: {
            if (!e.data.event) return;
            callEvent(e.data.event, e.data.data);
            return;
          }
          case MESSAGE_NAME.HEIGHT_CHECK: {
            if (typeof e.data.height === 'number') {
              setHeight(e.data.height);
            } else {
              console.log('Height assign request didnt have height value with it');
            }
            return;
          }
          case MESSAGE_NAME.REMOVE_REQUEST: {
            // onRemove && onRemove();
            return;
          }
        }
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
      unsubscribeFromDatastore(VERY_UNIQUE_ID);
      unsubscribeFromEvent(VERY_UNIQUE_ID);
    };
  }, []); // eslint-disable-line

  return (
    <PluginSlotContainer>
      <iframe
        key={VERY_UNIQUE_ID}
        ref={_iframe}
        height={height}
        name={title}
        title={title}
        src={url}
        sandbox={`allow-scripts ${plugin.manifest.parameters?.sandbox || ''}`}
      />
    </PluginSlotContainer>
  );
};

//
// Styles
//

const PluginSlotContainer = styled.div`
  padding: 0.5rem 0 1rem 0;
  height: 100%;

  iframe {
    border: none;
    width: 100%;
  }
`;

export default PluginSlot;
