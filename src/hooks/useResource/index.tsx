import { useState, useEffect, useRef } from 'react';
import { apiHttp } from '../../constants';
import { Event, EventType } from '../../ws';
import useWebsocket from '../useWebsocket';
import useInterval from '../useInterval';
import { APIError } from '../../types';
import { setLogItem } from '../../utils/debugdb';

export interface HookConfig<T, U> {
  // URL for fetch request
  url: string;
  // Parameters for url
  queryParams?: Record<string, string>;
  websocketParams?: Record<string, string>;
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
  // Separate update function for websocket messages.
  onWSUpdate?: (item: U, eventType: EventType) => void;
  socketParamFilter?: (params: Record<string, string>) => Record<string, string>;
  // ?
  privateCache?: boolean;
  // ?
  postRequest?: (target: string) => void;
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
}

interface ResourcePages {
  self: number;
  first: number;
  prev: number;
  next: number | null;
}

export type ResourceStatus = 'NotAsked' | 'Error' | 'Ok' | 'Loading';

export interface Resource<T> {
  url: string;
  data: T | null;
  error: APIError | null;
  getResult: () => DataModel<T> | undefined;
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

const defaultError = {
  id: 'generic-error',
  traceback: '',
  status: 500,
  title: 'Unknown error',
  type: 'error',
};

const notFoundError = {
  id: 'not-found',
  traceback: undefined,
  status: 404,
  title: 'Resource not found',
  type: 'error',
};

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
  websocketParams,
  socketParamFilter,
  updatePredicate = (_a, _b) => false,
  fetchAllData = false,
  onUpdate,
  onWSUpdate,
  privateCache = false,
  pause = false,
  fullyDisableCache = false,
  useBatching = false,
  postRequest,
  uuid,
}: HookConfig<T, U>): Resource<T> {
  const cache = useRef(privateCache ? createCache() : singletonCache).current;
  const [error, setError] = useState<APIError | null>(null);
  const initData = cache.get<T>(url)?.data || initialData;
  const [data, setData] = useState<T | null>(initData);
  const [status, setStatus] = useState<ResourceStatus>('NotAsked');

  const q = new URLSearchParams(queryParams).toString();
  const target = apiHttp(`${url}${q ? '?' + q : ''}`);
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
    queryParams: socketParamFilter ? socketParamFilter(queryParams || {}) : websocketParams || queryParams,
    enabled: subscribeToEvents && !pause,
    onUpdate: (event: Event<any>) => {
      if (pause) return;
      // TODO: Create cache item if it doesn't exist (How though? We have only partial data available.)
      const currentCache = cache.get(target);
      // If we have onUpdate function, lets update cache wihtout triggering update loop...
      const cacheSet = onUpdate ? cache.setInBackground : cache.set;

      // ..and update new data to component manually. This way we only send updated value to component instead of whole batch
      // Optionally we can also batch some amount of messages before sending them to component
      if (onUpdate || onWSUpdate) {
        if (useBatching) {
          if (!updateBatcher[target]) {
            updateBatcher[target] = [];
          }
          updateBatcher[target].push(event.data);
        } else {
          if (onWSUpdate) {
            onWSUpdate(event.data, event.type);
          } else if (onUpdate) {
            onUpdate(Array.isArray(initialData) ? [event.data] : event.data);
          }
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

  function newError(targetUrl: string, err: APIError) {
    setLogItem(`ERROR ${targetUrl} ${JSON.stringify(err)}`);
    setStatus('Error');
    setError(err);
  }

  function fetchData(targetUrl: string, signal: AbortSignal, cb: (isSuccess: boolean) => void, isSilent?: boolean) {
    setLogItem(`GET SENT ${targetUrl}`);
    fetch(targetUrl, { signal })
      .then((response) => {
        if (response.status === 200) {
          response
            .json()
            .then((result: DataModel<T>) => {
              setLogItem(`GET ${response.status} ${targetUrl} ${JSON.stringify(result)}`);
              const cacheItem = {
                result,
                data: result.data,
              };
              // If silent mode, we dont want cache to trigger update cycle, but we use onUpdate function.
              if (!fullyDisableCache) {
                const cacheSet = isSilent ? cache.setInBackground : cache.set;
                cacheSet(targetUrl, cacheItem);
              }

              if (onUpdate) {
                onUpdate(cacheItem.data as T);
                if (postRequest) {
                  postRequest(targetUrl);
                }
              }

              // If we want all data and we are have next page available we fetch it.
              // Else this fetch is done and we call the callback
              if (fetchAllData && cacheItem.result.links.next !== null && cacheItem.result.links.next !== targetUrl) {
                fetchData(cacheItem.result.links.next || targetUrl, signal, cb, true);
              } else {
                cb(true);
              }
            })
            .catch(() => {
              newError(targetUrl, defaultError);
            });
        } else {
          response
            .json()
            .then((result) => {
              if (typeof result === 'object' && result.id) {
                newError(targetUrl, result);
              } else if (response.status === 404) {
                newError(targetUrl, notFoundError);
              } else {
                newError(targetUrl, defaultError);
              }
            })
            .catch(() => {
              newError(targetUrl, defaultError);
              if (postRequest) {
                postRequest(targetUrl);
              }
            });
        }
      })
      .catch((_e) => {
        newError(targetUrl, defaultError);
        if (postRequest) {
          postRequest(targetUrl);
        }
      });
  }

  useEffect(() => {
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    if (!pause) {
      setStatus('Loading');
      setData(cache.get<T>(url)?.data || initialData);
      setError(null);

      fetchData(target, signal, (isSuccess) => {
        fulfilled = true;
        if (isSuccess) {
          setStatus('Ok');
        } else {
          newError(target, defaultError);
        }
      });
    } else {
      setStatus('NotAsked');
    }

    return () => {
      if (!fulfilled) {
        abortCtrl.abort();
      }
    };
  }, [target, pause]); // eslint-disable-line

  return { url, target, data, error, getResult: () => cache.get<T>(target)?.result, cache, status };
}
