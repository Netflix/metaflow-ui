import { useState, useEffect, useRef } from 'react';
import ResourceEvents, { Event, EventType, Unsubscribe } from '../../ws';
import { METAFLOW_SERVICE } from '../../constants';

export interface HookConfig<T, U> {
  url: string;
  initialData: T | T[] | null;
  subscribeToEvents?: boolean | string;
  queryParams?: Record<string, string | number>;
  updatePredicate?: (_: U, _l: U) => boolean;
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
export default function useResource<T, U>({
  url,
  initialData = null,
  subscribeToEvents = false,
  queryParams = {},
  updatePredicate = (_a, _b) => false,
}: HookConfig<T, U>): Resource<T> {
  const [error, setError] = useState(null);
  const [data, setData] = useState<T>(cache.get(url)?.data || initialData);

  const abortCtrl = useRef(new AbortController());
  const signal = abortCtrl.current.signal;

  // Construct query parameters string and append to url
  const queryString = Object.keys(queryParams)
    .filter((k) => queryParams[k] && queryParams[k] !== '')
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
    .join('&');

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
      unsubWebsocket = ResourceEvents.subscribe(eventResource, (event: Event<any>) => {
        if (event.type === EventType.INSERT) {
          // Get current cache and prepend to the list
          const currentCache = cache.get(url);

          // TODO: How do we handle this properly?
          cache.set(url, {
            ...currentCache,
            data: Array.isArray(currentCache.data)
              ? [event.data, ...currentCache.data]
              : (currentCache.data = event.data),
          });
        } else if (event.type === EventType.UPDATE) {
          // Get current cache and prepend to the list
          const currentCache = cache.get(url);

          // TODO: How do we handle this properly?
          cache.set(url, {
            ...currentCache,
            data: Array.isArray(currentCache.data)
              ? currentCache.data.map((item) => (updatePredicate(item, event.data) ? event.data : item))
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
    let target = `${METAFLOW_SERVICE}${url}`;
    if (queryString.length > 0) {
      target += `?${queryString}`;
    }

    // TODO: Always disable response cache for now
    // because it doesn't work for query parameters
    fetch(target, { signal })
      .then((response) =>
        response.json().then((result: DataModel<T>) => ({
          response,
          data: result.data,
        })),
      )
      .then(
        (cacheItem) => {
          cache.set(url, cacheItem);
        },
        (err) => {
          if (err.name !== 'AbortError') {
            console.error(err.name, err);
            setError(err.toString());
          }
        },
      );

    return () => {
      // TODO: Abort is disabled for now.
      // For some reason this always aborts the "upcoming" request
      // abortCtrl.current.abort(); // eslint-disable-line
    };
  }, [url, queryString]); // eslint-disable-line

  return { url, data, error };
}
