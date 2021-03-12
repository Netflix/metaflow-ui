import { useState, useEffect, useReducer } from 'react';
import { apiHttp } from '../../constants';
import { Event, EventType } from '../../ws';
import useWebsocket from '../useWebsocket';
import useInterval from '../useInterval';
import { APIError, AsyncStatus } from '../../types';
import { setLogItem } from '../../utils/debugdb';
import { logWarning } from '../../utils/errorlogger';

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
  onUpdate?: (item: T, response?: DataModel<T>) => void;
  // Separate update function for websocket messages.
  onWSUpdate?: (item: U, eventType: EventType) => void;
  socketParamFilter?: (params: Record<string, string>) => Record<string, string>;
  // ?
  privateCache?: boolean;
  // ?
  postRequest?: (success: boolean, target: string) => void;
  pause?: boolean;
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

export interface Resource<T> {
  url: string;
  data: T | null;
  error: APIError | null;
  getResult: () => DataModel<T> | null;
  target: string;
  status: AsyncStatus;
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

//
// Imperative store for some data. We want to use imperative functions like push when handling real time data
// in some cases for maximum performance. Using state inside the hooks seemed to be very non optimal performance wise.
//
const updateBatcher: Record<string, any> = {};

type StatusState = {
  id: number;
  status: AsyncStatus;
};

type StatusAction =
  | { type: 'setstatus'; id: number; status: AsyncStatus }
  | { type: 'set'; id: number; status: AsyncStatus };

const StatusReducer = (state: StatusState, action: StatusAction): StatusState => {
  switch (action.type) {
    case 'set': {
      return { ...state, id: action.id, status: action.status };
    }
    case 'setstatus':
      if (action.id === state.id) {
        return { ...state, status: action.status };
      }
      return state;
  }
};

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
  pause = false,
  useBatching = false,
  postRequest,
  uuid,
}: HookConfig<T, U>): Resource<T> {
  const [error, setError] = useState<APIError | null>(null);
  const initData = initialData;
  const [result, setResult] = useState<DataModel<T> | null>(null);
  const [data, setData] = useState<T | null>(initData);
  const [status, statusDispatch] = useReducer(StatusReducer, { id: 0, status: 'NotAsked' });
  const q = new URLSearchParams(queryParams).toString();
  const target = apiHttp(`${url}${q ? '?' + q : ''}`);
  // Call batch update
  useInterval(() => {
    if (useBatching && onUpdate && updateBatcher[target] && updateBatcher[target].length > 0) {
      onUpdate(updateBatcher[target]);
      updateBatcher[target] = [];
    }
  }, 1000);

  useWebsocket<U>({
    url: url,
    queryParams: socketParamFilter ? socketParamFilter(queryParams || {}) : websocketParams || queryParams,
    enabled: subscribeToEvents && !pause,
    onUpdate: (event: Event<any>) => {
      if (pause) return;
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
      } else {
        if (event.type === EventType.INSERT) {
          setData((d) => (Array.isArray(d) ? [event.data].concat(d) : d) as T);
        } else if (event.type === EventType.UPDATE) {
          // On update we need to use updatePredicate to update items in cache.
          setData(
            (d) =>
              (Array.isArray(d) ? d.map((item) => (updatePredicate(item, event.data) ? event.data : item)) : d) as T,
          );
        }
      }
    },
    uuid,
  });

  function newError(targetUrl: string, err: APIError, id: number) {
    setLogItem(`ERROR ${targetUrl} ${JSON.stringify(err)}`);
    statusDispatch({ type: 'setstatus', id, status: 'Error' });
    setError(err);
    logWarning(`HTTP error id: ${err.id}, url: ${targetUrl}`);
  }

  function fetchData(targetUrl: string, signal: AbortSignal, cb: (isSuccess: boolean) => void, requestid: number) {
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

              if (onUpdate) {
                onUpdate(cacheItem.data as T, result);
                postRequest && postRequest(true, targetUrl);
              } else {
                setData(result.data);
                setResult(result);
              }

              // If we want all data and we are have next page available we fetch it.
              // Else this fetch is done and we call the callback
              if (fetchAllData && cacheItem.result.links.next !== null && cacheItem.result.links.next !== targetUrl) {
                fetchData(cacheItem.result.links.next || targetUrl, signal, cb, requestid);
              } else {
                cb(true);
              }
            })
            .catch(() => {
              newError(targetUrl, defaultError, requestid);
            });
        } else {
          response
            .json()
            .then((result) => {
              if (typeof result === 'object' && result.id) {
                newError(targetUrl, result, requestid);
              } else if (response.status === 404) {
                newError(targetUrl, notFoundError, requestid);
              } else {
                newError(targetUrl, defaultError, requestid);
              }
              postRequest && postRequest(false, targetUrl);
            })
            .catch(() => {
              newError(targetUrl, defaultError, requestid);
              postRequest && postRequest(false, targetUrl);
            });
        }
      })
      .catch((_e) => {
        newError(targetUrl, defaultError, requestid);
        postRequest && postRequest(false, targetUrl);
      });
  }

  useEffect(() => {
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    if (!pause) {
      const requestid = Date.now();
      statusDispatch({ type: 'set', id: requestid, status: 'Loading' });

      if (error !== null) {
        setError(null);
      }

      fetchData(
        target,
        signal,
        (isSuccess) => {
          fulfilled = true;
          if (isSuccess) {
            statusDispatch({ type: 'setstatus', id: requestid, status: 'Ok' });
          } else {
            newError(target, defaultError, requestid);
          }
        },
        requestid,
      );
    }

    return () => {
      if (!fulfilled) {
        abortCtrl.abort();
      }
    };
  }, [target, pause]); // eslint-disable-line

  return { url, target, data, error, getResult: () => result, status: status.status };
}
