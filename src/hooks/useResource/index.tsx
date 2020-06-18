import { useState, useEffect, useRef } from 'react';
import ResourceEvents, { Event, EventType, Unsubscribe } from '../../ws';
import { METAFLOW_SERVICE } from '../../constants';

export interface HookConfig<T> {
  url: string;
  initialData: T | T[] | null;
  subscribeToEvents?: boolean | string;
  queryParams?: Record<string, string | number>;
}

interface DataModel<T> {
  data: T | T[];
  status: number;
  links: ResourceLinks;
  pages?: ResourcePages;
  query: object;
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
}

interface CacheItem<T> {
  stale?: boolean;
  response: Response;
  data: T | T[] | null;
}

let uid = 1;
const createCacheId = () => uid++;

export function createCache() {
  const cache: Record<string, CacheItem<any>> = {};
  const subscribers: Record<string, Record<number, () => void>> = {};

  const update = <T,>(key: string, fn: (prev: CacheItem<T>) => CacheItem<T>) => {
    cache[key] = fn(cache[key]);
    Object.values(subscribers[key]).forEach((f) => f());
  };

  const subscribe = (key: string, fn: () => void) => {
    if (!subscribers[key]) subscribers[key] = {};
    const id = createCacheId();
    subscribers[key][id] = fn;
    return () => delete subscribers[key][id];
  };

  const get = (key: string): CacheItem<any> => cache[key];
  const set = (key: string, value: CacheItem<any>) => update(key, () => value);

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

  const abortCtrl = useRef(new AbortController());
  const signal = abortCtrl.current.signal;

  useEffect(() => {
    // Subscribe to cache events
    const unsubCache = cache.subscribe(url, () => {
      setData(cache.get(url).data);
    });

    return () => {
      // Unsubscribe from cache events
      unsubCache();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    // Subscribe to Websocket events (optional)
    // `subscribeToEvents` = true    = Subscribe to `url`
    // `subscribeToEvents` = string  = Subscribe to `event`
    let unsubWebsocket: Unsubscribe | null = null;
    if (subscribeToEvents) {
      const eventResource = typeof subscribeToEvents === 'string' ? subscribeToEvents : url;
      unsubWebsocket = ResourceEvents.subscribe(eventResource, (event: Event<T>) => {
        if (event.type === EventType.CREATE) {
          // Get current cache and prepend to the list
          const currentCache = cache.get(url);

          cache.set(url, {
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
    const cached = cache.get(url);
    if (!cached || !cached.data || cached.stale) {
      let target = `${METAFLOW_SERVICE}${url}`;

      // Construct query parameters string and append to url
      const qs = Object.keys(queryParams || {})
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
        .join('&');
      if (qs.length > 0) {
        target += `?${qs}`;
      }

      fetch(target, { signal })
        .then((response) =>
          response.json().then((result: DataModel<T>) => ({
            response,
            data: result.data,
          })),
        )
        .then((cacheItem) => cache.set(url, cacheItem), setError);
    }

    return () => {
      abortCtrl.current.abort(); // eslint-disable-line
    };
  }, [url]); // eslint-disable-line

  return { url, data, error };
}
