import React, { useCallback, useEffect, useState } from 'react';
import { apiHttp } from '../../constants';

/**
 * How plugins works:
 *
 * 1) UI fetches list of plugin definitions (see type Plugin) from server /api/plugins.
 * 2) UI renders all plugins to PluginRegisterSystem.
 * 3) Plugin calls register message from iframe and if everything is good plugin will be registered to be rendered on actual slot.
 *
 */

//
// Typedef
//

export type Plugin = {
  name: string;
  repository: string | null;
  ref: string | null;
  parameters: Record<string, string>;
  config: {
    name: string;
    version: string;
    entrypoint: string;
  } & PluginSettings;
  identifier: string;
  files: string[];
};

export type PluginSettings = {
  slot: AllowedSlot;
  visible?: boolean;
  container?: string; // Should be enum?
  containerProps?: Record<string, unknown>;
  useApplicationStyles?: boolean;
};

type PluginVersionInfo = {
  api: string;
};

//
// Constants. Plugin will not render if it doesn't satisfy SUPPORTED_PLUGIN_API_VERSION.
//

export type AllowedSlot = 'task-details' | 'run-header';

const SUPPORTED_PLUGIN_API_VERSION = '0.13.0';
const RECOMMENDED_PLUGIN_API_VERSION = '1.1.0';
const ALLOWED_SLOTS: AllowedSlot[] = ['task-details', 'run-header'];

//
// Utils
//

export function pluginPath(config: Plugin, baseurl?: string): string {
  const path = `${config.name}/${config.config.entrypoint}`;
  return baseurl ? `${baseurl}/${path}` : apiHttp(`/plugin/${path}`);
}

export function isVersionEqualOrHigher(version: string, compareToVersion: string): boolean {
  const v = version.split('.').map(cleanupVersionNumber);
  const cv = compareToVersion.split('.').map(cleanupVersionNumber);

  // Is major version smaller than requested
  if (v[0] > cv[0]) {
    return true;
  } else if (v[0] === cv[0]) {
    // Is minor version smaller than requested
    if (v[1] > cv[1]) {
      return true;
    } else if (v[1] === cv[1]) {
      if (v[2] >= cv[2]) {
        return true;
      }
    }
  }

  return false;
}

// Version number might need some cleanup if someone is using custom versions like 1.2.3+customthing1
export function cleanupVersionNumber(versionStr: string): number {
  const nonNumberIndex = /[^0-9]/g.exec(versionStr);
  if (nonNumberIndex) {
    if (nonNumberIndex.index === 0) {
      return 0;
    }
    return parseInt(versionStr.slice(0, nonNumberIndex.index));
  }
  return parseInt(versionStr);
}
//
// Communication between plugin and app.
//

export const MESSAGE_NAME = {
  REGISTER: 'PluginRegisterEvent' as const,
  HEIGHT_CHECK: 'PluginHeightCheck' as const,
  SUBSCRIBE_DATA: 'PluginSubscribeToData' as const,
  SUBSCRIBE_EVENT: 'PluginSubscribeToEvent' as const,
  CALL_EVENT: 'PluginCallEvent' as const,
  REMOVE_REQUEST: 'PluginRemoveRequest' as const,
};

type UpdatePluginMessage = { slot: string; name: string; visible: boolean };

// Collection of functions to validate messages from plugins
export const PluginCommuncationsAPI = {
  isPluginMessage(event: MessageEvent, name?: string): boolean {
    return Object.values(MESSAGE_NAME).indexOf(event.data?.type) > -1 && event.data.name === name;
  },
  isRegisterMessage(
    event: MessageEvent,
  ): ({ name: string; version: { api: string } } & Record<string, unknown>) | false {
    if (
      event.data?.type === MESSAGE_NAME.REGISTER &&
      typeof event.data?.name === 'string' &&
      typeof event.data?.version === 'object' &&
      typeof event.data?.version?.api === 'string'
    ) {
      return { name: event.data.name, version: event.data.version, ...event.data };
    }
    return false;
  },
  isUpdatePluginMessage(value: unknown): value is UpdatePluginMessage {
    function isUpdateLike(given: unknown): given is Partial<Record<keyof UpdatePluginMessage, unknown>> {
      return typeof given === 'object' && given !== null;
    }
    return (
      isUpdateLike(value) &&
      typeof value.slot === 'string' &&
      typeof value.name === 'string' &&
      typeof value.visible === 'boolean'
    );
  },
};

//
// Plugins context
//

type PluginsContextProps = {
  plugins: Plugin[];
  getPluginsBySlot: (str: AllowedSlot) => Plugin[];
  register: (manifest: Plugin, version: PluginVersionInfo) => void;
  subscribeToDatastore: (key: string, path: string, fn: (data: unknown) => void) => void;
  unsubscribeFromDatastore: (key: string) => void;
  addDataToStore: (path: string, data: unknown) => void;
  clearDataStore: (path: string) => void;
  subscribeToEvent: (key: string, event: string, fn: (data: unknown) => void) => void;
  unsubscribeFromEvent: (key: string) => void;
  callEvent: (event: string, data?: unknown) => void;
};

//
// Plugin data store
//

type PluginDataStore = {
  data: Record<string, unknown>;
};

type PluginDataSubscription = {
  key: string; // Identifier for single plugin slot
  path: string; // Resource to subscribe to. eg 'task'
  fn: (data: unknown) => void; // Callback for dataupdates
};

let PluginDataSubscriptions: Array<PluginDataSubscription> = [];
const DataStore: PluginDataStore = { data: {} };

//
// Plugin event system
//

type PluginEventSubscription = {
  key: string; // Identifier for single plugin slot
  event: string;
  fn: (data: unknown) => void; // Callback for dataupdates
};

let PluginEventSubscriptions: Array<PluginEventSubscription> = [];

export const PluginsContext = React.createContext<PluginsContextProps>({} as PluginsContextProps);

//
// Plugin provider
//

export const PluginsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  const getPluginsBySlot = useCallback(
    (slot: string) => {
      return plugins.filter((item) => item.config.slot === slot);
    },
    [plugins],
  );

  function register(manifest: Plugin, version: PluginVersionInfo) {
    const alreadyRegistered =
      plugins.findIndex((p) => p.name === manifest.name && p.config.slot === manifest.config.slot) > -1;

    const slot = manifest.config.slot;

    if (!slot || ALLOWED_SLOTS.indexOf(slot) === -1) {
      console.warn(`Plugin '${manifest.name}' did not give valid slot to register.`);
      return;
    }

    if (!alreadyRegistered) {
      if (version && !isVersionEqualOrHigher(version.api, SUPPORTED_PLUGIN_API_VERSION)) {
        console.warn(
          `Plugin '${manifest.name}' is using unsupported version of plugin API. Please update plugin to use plugin API version ${SUPPORTED_PLUGIN_API_VERSION} or higher.`,
        );
        return;
      }

      if (version && !isVersionEqualOrHigher(version.api, RECOMMENDED_PLUGIN_API_VERSION)) {
        console.warn(
          `Plugin '${manifest.name}' is using older than recommended version of plugin API. Update plugin to use plugin API version ${RECOMMENDED_PLUGIN_API_VERSION} or higher for most recent features and fixes.`,
        );
      }

      if (!version) {
        console.warn(`Plugin '${manifest.name}' didn't provide plugin API version.`);
      }

      const newPlugin = { ...manifest, config: { visible: true, useApplicationStyles: true, ...manifest.config } };

      setPlugins((items) => [...items, newPlugin]);
    }
  }

  //
  // Datastore
  //

  // Sub to data
  const subscribeToDatastore = useCallback((key: string, path: string, fn: (data: unknown) => void) => {
    // If we have data, call subscription callback right away
    if (DataStore.data[path]) {
      fn(DataStore.data[path]);
    }
    PluginDataSubscriptions.push({ path, fn, key });
  }, []);

  // Unsub from data
  const unsubscribeFromDatastore = useCallback((key: string) => {
    PluginDataSubscriptions = PluginDataSubscriptions.filter((item) => item.key !== key);
  }, []);

  // Add new data and trigger subs
  const addDataToStore = useCallback((path: string, data: unknown) => {
    DataStore.data = { ...DataStore.data, [path]: data };
    for (const item of PluginDataSubscriptions.filter((s) => s.path === path)) {
      item.fn(data);
    }
  }, []);

  // Clear the store before a metadata request
  const clearDataStore = useCallback((path: string) => {
    DataStore.data = { ...DataStore.data, [path]: {} };
  }, []);

  //
  // Event system
  //

  const subscribeToEvent = useCallback((key: string, event: string, fn: (data: unknown) => void) => {
    PluginEventSubscriptions.push({ event, fn, key });
  }, []);

  const unsubscribeFromEvent = useCallback((key: string) => {
    PluginEventSubscriptions = PluginEventSubscriptions.filter((item) => item.key !== key);
  }, []);

  const callEvent = useCallback((event: string, data?: unknown) => {
    for (const sub of PluginEventSubscriptions.filter((item) => item.event === event)) {
      sub.fn(data);
    }
  }, []);

  // Susbcribe to listen UPDATE_PLUGIN messages so we can update plugin visibility.
  useEffect(() => {
    subscribeToEvent('plugin_manager', 'UPDATE_PLUGIN', (data) => {
      if (PluginCommuncationsAPI.isUpdatePluginMessage(data)) {
        setPlugins((items) =>
          items.map((pl) =>
            pl.name === data.name && pl.config.slot === data.slot
              ? { ...pl, config: { ...pl.config, visible: data.visible } }
              : pl,
          ),
        );
      }
    });
    return () => unsubscribeFromEvent('plugin_manager');
  }, [unsubscribeFromEvent, subscribeToEvent]);

  const contextValue = {
    plugins,
    getPluginsBySlot,
    register,
    subscribeToDatastore,
    unsubscribeFromDatastore,
    addDataToStore,
    clearDataStore,
    subscribeToEvent,
    unsubscribeFromEvent,
    callEvent,
  };

  return <PluginsContext.Provider value={contextValue}>{children}</PluginsContext.Provider>;
};
