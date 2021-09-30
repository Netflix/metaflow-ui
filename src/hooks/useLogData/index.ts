import { useEffect, useRef, useState } from 'react';
import { Log, AsyncStatus, APIError } from '../../types';
import { DataModel, defaultError } from '../../hooks/useResource';
import { apiHttp } from '../../constants';

export type LogItem = Log | 'Loading' | 'Error' | undefined;

export type LogData = {
  logs: Array<LogItem>;
  preloadStatus: AsyncStatus;
  status: AsyncStatus;
  loadMore: (index: number) => void;
  error: APIError | null;
};

export type LogDataSettings = {
  preload: boolean;
  paused: boolean;
  url: string;
  pagesize?: number;
};

const DEFAULT_PAGE_SIZE = 500;

function isOkResult(param: DataModel<Log[]> | APIError): param is DataModel<Log[]> {
  return 'data' in param;
}

/**
 * Currently useLogData does not include websocket support.
 *
 * Log amounts might be massive so we want to load them paginated and on demand depending on user
 * actions. When preload is active (task is on running status) we first load what ever we get and after
 * task completes we need to fetch again.
 */

const useLogData = ({ preload, paused, url, pagesize }: LogDataSettings): LogData => {
  const [status, setStatus] = useState<AsyncStatus>('NotAsked');
  const [preloadStatus, setPreloadStatus] = useState<AsyncStatus>('NotAsked');
  const [error, setError] = useState<APIError | null>(null);
  // Datastore
  const [logs, setLogs] = useState<LogItem[]>([]);
  const PAGE_SIZE = pagesize || DEFAULT_PAGE_SIZE;

  const aborter = useRef<AbortController>();

  // generic log fetcher
  function fetchLogs(
    page: number,
    order: '+' | '-' = '+',
  ): Promise<{ type: 'error'; error: APIError } | { type: 'ok'; data: Log[] }> {
    const requestUrl = url;
    const fullUrl = `${requestUrl}${requestUrl.indexOf('?') > -1 ? '&' : '?'}_limit=${PAGE_SIZE}${
      page ? `&_page=${page}` : ''
    }&_order=${order}row`;

    if (aborter.current) {
      aborter.current.abort();
    }

    const currentAborter = new AbortController();
    aborter.current = currentAborter;

    return fetch(apiHttp(fullUrl), { signal: currentAborter.signal })
      .then((response) => response.json())
      .then((result: DataModel<Log[]> | APIError) => {
        if (isOkResult(result)) {
          setLogs((array) => {
            const newarr = [...array];
            for (const item of result.data) {
              newarr[item.row] = item;
            }
            return newarr;
          });
          return { type: 'ok' as const, data: result.data };
        } else {
          return { type: 'error' as const, error: result };
        }
      })
      .catch((e) => {
        if (e instanceof DOMException) {
          return { type: 'error', error: { ...defaultError, id: 'user-aborted' } };
        }
        return { type: 'error', error: defaultError };
      });
  }

  function fetchPreload() {
    setPreloadStatus('Loading');
    fetchLogs(1, '-').then((result) => {
      if (result.type === 'error') {
        if (result.error.id === 'user-aborted') {
          setPreloadStatus('NotAsked');
          return;
        }
        setPreloadStatus('Error');
        return;
      }

      setPreloadStatus('Ok');
    });
  }

  // Clean up on url change
  useEffect(() => {
    setStatus('NotAsked');
    setPreloadStatus('NotAsked');
    setLogs([]);
    setError(null);
  }, [url]); // eslint-disable-line

  // Fetch logs when task gets completed
  useEffect(() => {
    if (status === 'NotAsked' && !paused) {
      setStatus('Loading');

      fetchLogs(1, '-').then((result) => {
        if (result.type === 'error') {
          if (result.error.id === 'user-aborted') {
            return;
          }

          setStatus('Error');
          setError(result.error);
          return;
        }

        setStatus('Ok');
      });
    }
  }, [paused, url, status]); // eslint-disable-line

  useEffect(() => {
    // For preload to happen following rules has to be matched
    // paused        -> Run has to be on running state
    // status        -> This should always be NotAsked if paused is on. Check just in case
    // preload       -> Run has to be runnign
    // preloadStatus -> We havent triggered this yet.
    if (paused && status === 'NotAsked' && preload && preloadStatus === 'NotAsked') {
      fetchPreload();
    }
  }, [paused, preload, preloadStatus, status, url]); // eslint-disable-line

  // Poller for auto updates when task is running
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (['Ok', 'Error'].includes(preloadStatus) && paused) {
      t = setTimeout(() => {
        fetchPreload();
      }, 20000);
    }
    return () => {
      clearTimeout(t);
    };
  }, [preloadStatus, paused]); // eslint-disable-line

  // loadMore gets triggered on all scrolling events on list.
  function loadMore(index: number) {
    // Get page number. Add one to correct lines starting from index 0
    const page = Math.ceil((index + 1) / PAGE_SIZE);
    // Need to have initial page before any other request.
    if ((status === 'Ok' || preloadStatus === 'Ok') && !logs[index]) {
      setLogs((arr) => {
        // Since we are fetching stuff as pages, find start of page where current line is
        // and fill them as loading so we dont try to fetch same page again.
        const startOfPage = (page - 1) * PAGE_SIZE;
        const endOfPage = startOfPage + PAGE_SIZE;

        for (let i = startOfPage; i < endOfPage; i++) {
          arr[i] = arr[i] || 'Loading';
        }
        return arr;
      });

      fetchLogs(page, '+').then((result) => {
        if (result.type === 'error') {
          return;
        }
      });
    }
  }

  return { logs, status, preloadStatus, error, loadMore };
};

export default useLogData;
