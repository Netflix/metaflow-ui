import { useState, useEffect, useRef } from 'react';
import ResourceEvents, { Event, EventType, Unsubscribe } from '../../ws';
import { METAFLOW_SERVICE } from '../../constants';

export interface HookConfig<T, U> {
  url: string;
  initialData: T | T[] | null;
  subscribeToEvents?: boolean | string;
  updatePredicate?: (_: U, _l: U) => boolean;
  fetchAllData?: boolean;
  onUpdate?: (item: T) => void;
  queryParams?: Record<string, string>;
  privateCache?: boolean;
  pause?: boolean;
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
  cache: CacheInterface;
  target: string;
}

interface CacheItem<T> {
  stale?: boolean;
  result: DataModel<T>;
  data: T | T[] | null;
}

interface CacheInterface {
  subscribe: (k: string, f: () => void) => () => void;
  update: <T>(k: string, f: (prev: CacheItem<T>) => CacheItem<T>, silent: boolean) => void;
  get: (k: string) => CacheItem<any>;
  set: (k: string, v: CacheItem<any>) => void;
  setInBackground: (k: string, v: CacheItem<any>) => void;
  keys: () => string[];
}

let uid = 1;
const createCacheId = () => uid++;

export function createCache(): CacheInterface {
  const cache: Record<string, CacheItem<any>> = {};
  const subscribers: Record<string, Record<number, () => void>> = {};

  const update: CacheInterface['update'] = (key, fn, silent) => {
    cache[key] = fn(cache[key]);
    !silent && Object.values(subscribers[key]).forEach((f) => f());
  };

  const subscribe: CacheInterface['subscribe'] = (key, fn) => {
    if (!subscribers[key]) subscribers[key] = {};
    const id = createCacheId();
    subscribers[key][id] = fn;
    return () => delete subscribers[key][id];
  };

  const get: CacheInterface['get'] = (key) => cache[key];
  const set: CacheInterface['set'] = (key, value) => update(key, () => value, false);
  const setInBackground: CacheInterface['set'] = (key, value) => update(key, () => value, true);

  const keys: CacheInterface['keys'] = () => Object.keys(cache);

  return {
    subscribe,
    update,
    get,
    set,
    setInBackground,
    keys,
  };
}

// default cache
const singletonCache = createCache();

// TODO: cache map, cache subscriptions, ws connections, cache mutations
export default function useResource<T, U>({
  url,
  initialData = null,
  subscribeToEvents = false,
  queryParams = {},
  updatePredicate = (_a, _b) => false,
  fetchAllData = false,
  onUpdate,
  privateCache = false,
  pause = false,
}: HookConfig<T, U>): Resource<T> {
  const cache = useRef(privateCache ? createCache() : singletonCache).current;
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
  }, [target, cache]);

  useEffect(() => {
    // Subscribe to Websocket events (optional)
    // `subscribeToEvents` = true    = Subscribe to `url`
    // `subscribeToEvents` = string  = Subscribe to `event`
    let unsubWebsocket: Unsubscribe | null = null;
    if (subscribeToEvents) {
      const eventResource = typeof subscribeToEvents === 'string' ? subscribeToEvents : url;
      unsubWebsocket = ResourceEvents.subscribe(eventResource, (event: Event<any>) => {
        const currentCache = cache.get(target);
        const cacheSet = onUpdate ? cache.setInBackground : cache.set;

        if (onUpdate) {
          onUpdate(Array.isArray(currentCache.data) ? [event.data] : event.data);
        }

        if (event.type === EventType.INSERT) {
          cacheSet(target, {
            ...currentCache,
            data: Array.isArray(currentCache.data)
              ? [event.data, ...currentCache.data]
              : (currentCache.data = event.data),
          });
        } else if (event.type === EventType.UPDATE) {
          cacheSet(target, {
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

  function fetchData(targetUrl: string, signal: AbortSignal, cb: () => void, isSilent?: boolean) {
    fetch(targetUrl, { signal })
      .then((response) =>
        response.json().then((result: DataModel<T>) => ({
          result,
          data: result.data,
        })),
      )
      .then(
        (cacheItem) => {
          const cacheSet = isSilent ? cache.setInBackground : cache.set;
          cacheSet(targetUrl, cacheItem);

          if (onUpdate) {
            onUpdate(cacheItem.data as T);
          }

          if (
            fetchAllData &&
            cacheItem.result.pages?.self !== cacheItem.result.pages?.last &&
            cacheItem.result.links.next !== targetUrl
          ) {
            fetchData(cacheItem.result.links.next || targetUrl, signal, cb, true);
          } else {
            cb();
          }
        },
        (error) => {
          if (error.name !== 'AbortError') {
            setError(error.toString());
          }
          cb();
        },
      );
  }

  function findAllRelatedDataFromCache(currentTarget: string): any {
    const cached = cache.get(currentTarget);
    return [
      ...cached.data,
      ...(cached.result.pages?.self !== cached.result.pages?.last
        ? findAllRelatedDataFromCache(cached.result.links.next || '')
        : []),
    ];
  }

  useEffect(() => {
    const cached = cache.get(target);
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    if (!pause && (!cached || !cached.data || cached.stale)) {
      fetchData(target, signal, () => {
        fulfilled = true;
      });
    } else if (cached) {
      setData(cached.data);
      // If we should return all data, lets check if there is other entries in cache.
      // Wrapped in setTimeout so it happens async.
      if (fetchAllData && onUpdate) {
        setTimeout(() => {
          onUpdate(findAllRelatedDataFromCache(target));
        }, 0);
      }
    }

    return () => {
      if (!fulfilled) {
        abortCtrl.abort();
      }
    };
  }, [target]); // eslint-disable-line

  return { url, target, data, error, getResult: () => cache.get(target)?.result, cache };
}
