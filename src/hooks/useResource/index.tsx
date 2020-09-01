import { useState, useEffect, useRef } from 'react';
import { METAFLOW_SERVICE } from '../../constants';
import { Event, EventType } from '../../ws';
import useWebsocket from '../useWebsocket';
import useInterval from '../useInterval';

export interface HookConfig<T, U> {
  // URL for fetch request
  url: string;
  // Parameters for url
  queryParams?: Record<string, string>;
  initialData: T | null;
  // URL for websockets / flag to use url instead
  subscribeToEvents?: boolean;
  // Function for websocket update messages. Used to define if existing value should be updated
  updatePredicate?: (_: U, _l: U) => boolean;
  // Flag to fetch all available data for given query. Will fetch every paginated page until fetched last page.
  fetchAllData?: boolean;
  // Update function to trigger something on component when new data arrives. This way we dont have to update whole data set
  // if we get one new entity
  onUpdate?: (item: T) => void;
  // ?
  privateCache?: boolean;
  // ?
  pause?: boolean;
  fullyDisableCache?: boolean;
  useBatching?: boolean;
  uuid?: string;
}

export interface DataModel<T> {
  data: T;
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

export type ResourceStatus = 'NotAsked' | 'Error' | 'Ok' | 'Loading';

export interface Resource<T> {
  url: string;
  data: T | null;
  error: Error | null;
  getResult: () => DataModel<T>;
  cache: CacheInterface;
  target: string;
  status: ResourceStatus;
}

interface CacheItem<T> {
  stale?: boolean;
  result: DataModel<T>;
  data: T | null;
}

interface CacheInterface {
  subscribe: (k: string, f: () => void) => () => void;
  update: <T>(k: string, f: (prev: CacheItem<T>) => CacheItem<T>, silent: boolean) => void;
  get: <T>(k: string) => CacheItem<T>;
  set: <T>(k: string, v: CacheItem<T>) => void;
  setInBackground: <T>(k: string, v: CacheItem<T>) => void;
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
//
// Imperative store for some data. We want to use imperative functions like push when handling real time data
// in some cases for maximum performance. Using state inside the hooks seemed to be very non optimal performance wise.
//
const updateBatcher: Record<string, any> = {};

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
  fullyDisableCache = false,
  useBatching = false,
  uuid,
}: HookConfig<T, U>): Resource<T> {
  const cache = useRef(privateCache ? createCache() : singletonCache).current;
  const [error, setError] = useState(null);
  const initData = cache.get<T>(url)?.data || initialData;
  const [data, setData] = useState<T | null>(initData);
  const [status, setStatus] = useState<ResourceStatus>('NotAsked');

  const q = new URLSearchParams(queryParams).toString();
  const target = `${METAFLOW_SERVICE}${url}${q ? '?' + q : ''}`;
  // Call batch update
  useInterval(() => {
    if (useBatching && onUpdate && updateBatcher[target] && updateBatcher[target].length > 0) {
      onUpdate(updateBatcher[target]);
      updateBatcher[target] = [];
    }
  }, 500);

  useEffect(() => {
    const unsubCache = cache.subscribe(target, () => {
      const data = cache.get<T>(target).data;
      if (data) {
        setData(data);
      }
    });

    return () => {
      unsubCache();
    };
  }, [target, cache]);

  useWebsocket<U>({
    url: url,
    queryParams: queryParams,
    enabled: subscribeToEvents,
    onUpdate: (event: Event<any>) => {
      if (pause) return;
      // TODO: Create cache item if it doesn't exist (How though? We have only partial data available.)
      const currentCache = cache.get(target);
      // If we have onUpdate function, lets update cache wihtout triggering update loop...
      const cacheSet = onUpdate ? cache.setInBackground : cache.set;
      // ..and update new data to component manually. This way we only send updated value to component instead of whole batch
      // Optionally we can also batch some amount of messages before sending them to component
      if (onUpdate) {
        if (useBatching) {
          if (!updateBatcher[target]) {
            updateBatcher[target] = [];
          }
          updateBatcher[target].push(event.data);
        } else {
          onUpdate(Array.isArray(initialData) ? [event.data] : event.data);
        }
      }
      // We can skip cache step if we have disabled it
      if (!fullyDisableCache) {
        const safeCache = currentCache || { data: initialData };
        if (event.type === EventType.INSERT) {
          cacheSet(target, {
            ...safeCache,
            data: Array.isArray(safeCache.data) ? [event.data].concat(safeCache.data) : (safeCache.data = event.data),
          });
        } else if (event.type === EventType.UPDATE) {
          // On update we need to use updatePredicate to update items in cache.
          cacheSet(target, {
            ...safeCache,
            data: Array.isArray(safeCache.data)
              ? safeCache.data.map((item) => (updatePredicate(item, event.data) ? event.data : item))
              : (safeCache.data = event.data),
          });
        }
      }
    },
    uuid,
  });

  function fetchData(targetUrl: string, signal: AbortSignal, cb: (isSuccess: boolean) => void, isSilent?: boolean) {
    fetch(targetUrl, { signal })
      .then((response) =>
        response.json().then((result: DataModel<T>) => ({
          result,
          data: result.data,
        })),
      )
      .then(
        (cacheItem) => {
          // If silent mode, we dont want cache to trigger update cycle, but we use onUpdate function.
          if (!fullyDisableCache) {
            const cacheSet = isSilent ? cache.setInBackground : cache.set;
            cacheSet(targetUrl, cacheItem);
          }

          if (onUpdate) {
            onUpdate(cacheItem.data as T);
          }

          // If we want all data and we are have next page available we fetch it.
          // Else this fetch is done and we call the callback
          if (
            fetchAllData &&
            cacheItem.result.pages?.self !== cacheItem.result.pages?.last &&
            cacheItem.result.links.next !== targetUrl
          ) {
            fetchData(cacheItem.result.links.next || targetUrl, signal, cb, true);
          } else {
            cb(true);
          }
        },
        (error) => {
          if (error.name !== 'AbortError') {
            setError(error.toString());
          }
          cb(false);
        },
      );
  }

  /**
   * Finds data for current cache entry and checks if there is next page available.
   * Recursively finds all data available for current query.
   * @param currentTarget cache key (basically url of endpoint we fetched the data)
   */
  /*function findAllRelatedDataFromCache(currentTarget: string): any {
    const cached = cache.get<T>(currentTarget);
    return [
      ...(cached.data || []),
      ...(cached.result.pages?.self !== cached.result.pages?.last
        ? findAllRelatedDataFromCache(cached.result.links.next || '')
        : []),
    ];
  }*/

  useEffect(() => {
    // const cached = cache.get<T>(target);
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    //if ((!pause && (!cached || !cached.data || cached.stale)) || true) {
    if (!pause) {
      setStatus('Loading');

      fetchData(target, signal, (isSuccess) => {
        fulfilled = true;
        if (isSuccess) {
          setStatus('Ok');
        } else {
          setStatus('Error');
        }
      });
    }
    /*} else if (cached && cached.data) {
      setData(cached.data);
      // If we should return all data, lets check if there is other entries in cache.
      // Wrapped in setTimeout so it doesnt block rendering on huge data masses.
      if (fetchAllData && onUpdate) {
        setTimeout(() => {
          onUpdate(findAllRelatedDataFromCache(target));
        }, 0);
      }
    }*/

    return () => {
      if (!fulfilled) {
        abortCtrl.abort();
      }
    };
  }, [target]); // eslint-disable-line

  return { url, target, data, error, getResult: () => cache.get<T>(target)?.result, cache, status };
}
