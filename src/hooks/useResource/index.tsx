import { useState, useEffect } from 'react';
import ResourceEvents, { Event, EventType, Unsubscribe } from '../../ws';
import { METAFLOW_SERVICE } from '../../constants';

export interface HookConfig<T> {
  url: string;
  initialData: T | T[] | null;
  subscribeToEvents?: boolean | string;
  queryParams?: Record<string, string>;
}

interface DataModel<T> {
  data: T | T[];
  status: number;
  links: ResourceLinks;
  pages?: ResourcePages;
  query: Record<string, unknown>;
}

interface ResourceLinks {
  self: string;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

interface ResourcePages {
  self: number;
  first: number;
  prev: number;
  next: number;
  last: number;
}

export interface Resource<T> {
  url: string;
  data: T;
  error: Error | null;
  getResult: () => DataModel<T>;
}

interface CacheItem<T> {
  stale?: boolean;
  result: DataModel<T>;
  data: T | T[] | null;
}

interface CacheInterface {
  subscribe: (k: string, f: () => void) => () => void;
  update: <T>(k: string, f: (prev: CacheItem<T>) => CacheItem<T>) => void;
  get: (k: string) => CacheItem<any>;
  set: (k: string, v: CacheItem<any>) => void;
}

let uid = 1;
const createCacheId = () => uid++;

export function createCache(): CacheInterface {
  const cache: Record<string, CacheItem<any>> = {};
  const subscribers: Record<string, Record<number, () => void>> = {};

  const update: CacheInterface['update'] = (key, fn) => {
    cache[key] = fn(cache[key]);
    Object.values(subscribers[key]).forEach((f) => f());
  };

  const subscribe: CacheInterface['subscribe'] = (key, fn) => {
    if (!subscribers[key]) subscribers[key] = {};
    const id = createCacheId();
    subscribers[key][id] = fn;
    return () => delete subscribers[key][id];
  };

  const get: CacheInterface['get'] = (key) => cache[key];
  const set: CacheInterface['set'] = (key, value) => update(key, () => value);

  return {
    subscribe,
    update,
    get,
    set,
  };
}

// default cache
const cache = createCache();

// TODO: cache map, cache subscriptions, ws connections, cache mutations
export default function useResource<T>({
  url,
  initialData = null,
  subscribeToEvents = false,
  queryParams = {},
}: HookConfig<T>): Resource<T> {
  const [error, setError] = useState(null);
  const [data, setData] = useState<T>(cache.get(url)?.data || initialData);

  const q = new URLSearchParams(queryParams).toString();
  const target = `${METAFLOW_SERVICE}${url}${q ? '?' + q : ''}`;

  useEffect(() => {
    const unsubCache = cache.subscribe(target, () => {
      setData(cache.get(target).data);
    });

    return () => {
      unsubCache();
    };
  }, [target]);

  useEffect(() => {
    // Subscribe to Websocket events (optional)
    // `subscribeToEvents` = true    = Subscribe to `url`
    // `subscribeToEvents` = string  = Subscribe to `event`
    let unsubWebsocket: Unsubscribe | null = null;
    if (subscribeToEvents) {
      const eventResource = typeof subscribeToEvents === 'string' ? subscribeToEvents : url;
      unsubWebsocket = ResourceEvents.subscribe(eventResource, (event: Event<T>) => {
        if (event.type === EventType.INSERT) {
          // Get current cache and prepend to the list
          const currentCache = cache.get(target);

          cache.set(target, {
            ...currentCache,
            data: Array.isArray(currentCache.data)
              ? [event.data, ...currentCache.data]
              : (currentCache.data = event.data),
          });
        }
      });
    }

    return () => {
      // Unsubscribe from Websocket events
      unsubWebsocket !== null && unsubWebsocket();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    const cached = cache.get(target);
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    if (!cached || !cached.data || cached.stale) {
      fetch(target, { signal })
        .then((response) =>
          response.json().then((result: DataModel<T>) => ({
            result,
            data: result.data,
          })),
        )
        .then(
          (cacheItem) => {
            cache.set(target, cacheItem);
            fulfilled = true;
          },
          (error) => {
            if (error.name !== 'AbortError') {
              setError(error.toString());
            }
            fulfilled = true;
          },
        );
    } else if (cached) {
      setData(cached.data);
    }

    return () => {
      if (!fulfilled) {
        abortCtrl.abort();
      }
    };
  }, [target]);

  return { url, data, error, getResult: () => cache.get(target)?.result };
}
