import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import PLUGIN_STYLESHEET from '@components/Plugins/PluginDefaultStyleSheet';
import { MESSAGE_NAME, Plugin, PluginCommunicationsAPI, PluginsContext } from '@components/Plugins/PluginManager';
import { TimezoneContext } from '@components/TimezoneProvider';
import { KnownURLParams, getRouteMatch } from '@utils/routing';

// Element id used for the injected host-theme variables stylesheet inside the plugin iframe.
// We re-target this element on theme changes so plugins stay in sync with the host (e.g. dark mode).
const PLUGIN_THEME_VARS_STYLE_ID = 'metaflow-plugin-theme-vars';

//
// Extracts the currently-applied CSS custom properties from the host
// document and serializes them into a `:root { ... }` CSS string suitable
// for injection into a plugin iframe.
//
// Reading computed values (rather than the raw stylesheet) captures any
// runtime overrides — for example a dark-mode toggle that sets
// `--color-bg-primary` to a different value on `document.documentElement`.
//
function getThemeCSSVariables(): string {
  const root = document.documentElement;
  const declaredProps = new Set<string>();

  const collectFromRules = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (rule.selectorText && (rule.selectorText.includes(':root') || rule.selectorText === 'html')) {
          for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i];
            if (prop.startsWith('--')) declaredProps.add(prop);
          }
        }
      } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
        collectFromRules(rule.cssRules);
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collectFromRules(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet — skip
    }
  }

  // Include inline custom properties applied directly to `<html>`
  for (let i = 0; i < root.style.length; i++) {
    const prop = root.style[i];
    if (prop.startsWith('--')) declaredProps.add(prop);
  }

  const computed = getComputedStyle(root);
  const declarations: string[] = [];
  declaredProps.forEach((prop) => {
    const value = computed.getPropertyValue(prop).trim();
    if (value) declarations.push(`  ${prop}: ${value};`);
  });

  return `:root {\n${declarations.join('\n')}\n}`;
}

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
  const { timezone } = useContext(TimezoneContext);

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
              settings: {
                timezone,
              },
            },
            '*',
          );
          if (plugin.config.useApplicationStyles) {
            const iframeContent = _iframe?.current?.contentDocument;
            if (iframeContent) {
              // Inject the static plugin stylesheet AND a snapshot of the host's
              // currently-resolved CSS custom properties. Resolving variables at
              // injection time captures any runtime overrides on `:root` (e.g.
              // an active dark-mode class) so plugins render with the same theme
              // as the host instead of always seeing the light defaults.
              const themeVars = getThemeCSSVariables();
              iframeContent.head.innerHTML =
                `<style>${PLUGIN_STYLESHEET}</style>` +
                `<style id="${PLUGIN_THEME_VARS_STYLE_ID}">${themeVars}</style>` +
                iframeContent.head.innerHTML;
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
    [VERY_UNIQUE_ID, callEvent, plugin, resourceParams, route, subscribeToDatastore, subscribeToEvent, title, timezone],
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

  //
  // Keep plugin iframe theme variables in sync with the host.
  //
  // When the host swaps its theme at runtime (e.g. dark mode toggled by
  // adding a class on `<html>` or flipping a CSS variable), the iframe
  // would otherwise be stuck on the snapshot taken at register time.
  // We watch for class/style mutations on `<html>` and re-write the
  // variables stylesheet inside the iframe whenever something changes.
  //
  useEffect(() => {
    if (!plugin.config.useApplicationStyles) return;

    const syncThemeVars = () => {
      const iframeContent = _iframe.current?.contentDocument;
      if (!iframeContent) return;
      const styleEl = iframeContent.getElementById(PLUGIN_THEME_VARS_STYLE_ID);
      if (styleEl) {
        styleEl.textContent = getThemeCSSVariables();
      }
    };

    const observer = new MutationObserver(syncThemeVars);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, [plugin.config.useApplicationStyles]);

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
