import { useState, useEffect, useReducer, useCallback } from 'react';
import { apiHttp } from '../../constants';
import { Event, EventType } from '../../ws';
import useWebsocket from '../useWebsocket';
import useInterval from '../useInterval';
import { APIError, AsyncStatus } from '../../types';
import { setLogItem } from '../../utils/debugdb';
import { logWarning } from '../../utils/errorlogger';

//
// Typedef
//
export interface HookConfig<T, U> {
  // URL for fetch request
  url: string;
  wsUrl?: string | ((result: T) => string);
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
  // By default we use same parameters for GET and websocket. With this function you can edit websocket params
  socketParamFilter?: (params: Record<string, string>) => Record<string, string>;
  // Function to trigger after every HTTP GET
  postRequest?: (success: boolean, target: string, result?: DataModel<T>) => void;
  // Is fetching funcs paused?
  pause?: boolean;
  // Return websocket updates in batches instead of real time (1sec interval).
  useBatching?: boolean;
  // Unique identifier for websocket messaging
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
  retry: () => void;
}

//
// Default errors
//

export const defaultError = {
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
// Imperative store for data if useBatching is on. Meaning that arriving websocket data is stored in this object while waiting to be batched to
// view. We use this to prevent dozens of renders per second for more intensive runs.
//
const updateBatcher: Record<string, unknown> = {};

//
// Status handling
//
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

const emptyObject = {};

//
// Hook
//

export default function useResource<T, U>({
  url,
  wsUrl,
  initialData = null,
  subscribeToEvents = false,
  queryParams = emptyObject,
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
  const [retryCounter, setRetryCounter] = useState(0);

  // Call batch update
  useInterval(() => {
    if (useBatching && onUpdate && updateBatcher[target] && (updateBatcher[target] as Array<U>).length > 0) {
      onUpdate(updateBatcher[target] as T);
      updateBatcher[target] = [];
    }
  }, 1000);

  const websocketUrl = getWebsocketUrl(url, data, wsUrl);

  useWebsocket<U>({
    url: websocketUrl,
    queryParams: socketParamFilter ? socketParamFilter(queryParams || {}) : websocketParams || queryParams,
    enabled: subscribeToEvents && !pause && !!websocketUrl,
    onUpdate: (event: Event<unknown>) => {
      if (pause) return;
      // If onUpdate or onWSUpdate is given, dont update stateful data object.
      if (onUpdate || onWSUpdate) {
        // On batching add item to batch object to be sent to view later
        if (useBatching) {
          if (!updateBatcher[target]) {
            updateBatcher[target] = [];
          }
          (updateBatcher[target] as Array<U>).push(event.data as U);
        } else {
          if (onWSUpdate) {
            onWSUpdate(event.data as U, event.type);
          } else if (onUpdate) {
            onUpdate((Array.isArray(initialData) ? [event.data] : event.data) as T);
          }
        }
      } else {
        if (event.type === EventType.INSERT) {
          setData((d) => (Array.isArray(d) ? [event.data].concat(d) : d) as T);
        } else if (event.type === EventType.UPDATE) {
          setData(
            (d) =>
              (Array.isArray(d)
                ? d.map((item) => (updatePredicate(item, event.data as U) ? event.data : item))
                : event.data) as T,
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

  const fetchData = useCallback(
    (targetUrl: string, signal: AbortSignal, cb: (isSuccess: boolean) => void, requestid: number) => {
      setLogItem(`GET SENT ${targetUrl}`);

      fetch(targetUrl, { signal })
        .then((response) => {
          if (response.status === 200) {
            response
              .json()
              .then((result: DataModel<T>) => {
                setLogItem(`GET ${response.status} ${targetUrl} ${JSON.stringify(result)}`);
                // If onUpdate, dont store data in stateful data object
                if (onUpdate) {
                  onUpdate(result.data as T, result);
                } else {
                  setData(result.data);
                  setResult(result);
                }

                // Trigger postRequest after every request if given.
                postRequest && postRequest(true, targetUrl, result);

                // If we want all data and we are have next page available we fetch it.
                // Else this fetch is done and we call the callback
                if (fetchAllData && result.links.next !== null && result.links.next !== targetUrl) {
                  fetchData(result.links.next || targetUrl, signal, cb, requestid);
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
    },
    [fetchAllData, onUpdate, postRequest, setData, setResult],
  );

  useEffect(() => {
    const abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    let fulfilled = false;

    if (!pause) {
      const requestid = Date.now();
      statusDispatch({ type: 'set', id: requestid, status: 'Loading' });

      if (!onUpdate) {
        setData(initialData);
      }

      fetchData(
        target,
        signal,
        (isSuccess) => {
          fulfilled = true;
          if (isSuccess) {
            statusDispatch({ type: 'setstatus', id: requestid, status: 'Ok' });
            if (error !== null) {
              setError(null);
            }
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
  }, [target, pause, retryCounter, error, onUpdate, fetchData, initialData]);

  const retry = useCallback(() => {
    setRetryCounter((val) => val + 1);
  }, []);

  const getResult = useCallback(() => result, [result]);

  return { url, target, data, error, getResult, status: status.status, retry };
}

function getWebsocketUrl<T>(url: string, data: T | null, wsUrl?: string | ((result: T) => string)): string {
  if (wsUrl) {
    if (typeof wsUrl === 'function') {
      return data ? wsUrl(data) : '';
    }
    return wsUrl;
  }
  return url;
}
