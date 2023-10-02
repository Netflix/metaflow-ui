import React, { useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import PLUGIN_STYLESHEET from './PluginDefaultStyleSheet';
import { PluginCommunicationsAPI, MESSAGE_NAME, PluginsContext, Plugin } from './PluginManager';
import { getRouteMatch, KnownURLParams } from '../../utils/routing';

//
// Typedef
//

type Props = {
  id: string;
  url: string;
  title: string;
  onRemove?: () => void;
  plugin: Plugin;
  // Way to override url params. Used for tests and plugin development
  resourceParams?: Record<string, string>;
};

//
// Renders single plugin to iframe. Also handles communications with plugin
//

const PluginSlot: React.FC<Props> = ({ id, url, title, plugin, resourceParams }) => {
  const [height, setHeight] = useState(150);
  const _iframe = useRef<HTMLIFrameElement>(null);
  const { subscribeToDatastore, unsubscribeFromDatastore, subscribeToEvent, callEvent, unsubscribeFromEvent } =
    useContext(PluginsContext);
  const loc = useLocation();
  const VERY_UNIQUE_ID = id + title + url;
  const route = useMemo(() => getRouteMatch(loc.pathname), [loc.pathname]);

  const listener = useCallback(
    (e: MessageEvent) => {
      if (PluginCommunicationsAPI.isRegisterMessage(e) && e.data.name === title) {
        const w = _iframe.current?.contentWindow;
        if (w) {
          w.postMessage(
            {
              type: 'ReadyToRender',
              config: plugin,
              resource: resourceParams ? resourceParams : route ? convertParams(route.params) : {},
            },
            '*',
          );
          if (plugin.config.useApplicationStyles) {
            const iframeContent = _iframe?.current?.contentDocument;
            if (iframeContent) {
              iframeContent.head.innerHTML = `<style>${PLUGIN_STYLESHEET}</style>` + iframeContent.head.innerHTML;
            }
          }
        } else {
          console.log('Register message happened when iframe wasnt ready');
        }
      }
      if (PluginCommunicationsAPI.isPluginMessage(e, title)) {
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
    },
    [VERY_UNIQUE_ID, callEvent, plugin, resourceParams, route, subscribeToDatastore, subscribeToEvent, title],
  );
  //
  // Subscribe to messages from iframe
  //
  useEffect(() => {
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [listener]);

  useEffect(() => {
    return () => {
      unsubscribeFromDatastore(VERY_UNIQUE_ID);
      unsubscribeFromEvent(VERY_UNIQUE_ID);
    };
  }, [VERY_UNIQUE_ID, unsubscribeFromDatastore, unsubscribeFromEvent]);

  return (
    <PluginSlotContainer>
      <iframe
        key={VERY_UNIQUE_ID}
        ref={_iframe}
        height={height}
        name={title}
        title={title}
        src={url}
        sandbox={`allow-scripts ${plugin.parameters?.sandbox || ''}`}
      />
    </PluginSlotContainer>
  );
};

//
//
//

type Params = {
  flow_id: string;
  run_number: string;
  step_name: string;
  task_id: string;
};

function convertParams(params: KnownURLParams | null): Partial<Params> {
  if (!params) return {};

  return Object.keys(params).reduce((obj: Partial<Params>, key) => {
    if (key === 'flowId') {
      obj.flow_id = params[key];
    }
    if (key === 'runNumber') {
      obj.run_number = params[key];
    }
    if (key === 'stepName') {
      obj.step_name = params[key];
    }
    if (key === 'taskId') {
      obj.task_id = params[key];
    }
    return obj;
  }, {});
}

//
// Styles
//

const PluginSlotContainer = styled.div`
  // padding: 0.5rem 0 1rem 0;
  height: 100%;

  iframe {
    border: none;
    width: 100%;
  }
`;

export default PluginSlot;
