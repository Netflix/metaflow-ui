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
  localSearch: LocalSearchType;
};

export type LogDataSettings = {
  preload: boolean;
  paused: boolean;
  url: string;
  pagesize?: number;
};

type LogSearchResult = {
  line: number;
  char: [number, number];
};

export type SearchState = { active: boolean; result: LogSearchResult[]; current: number; query: string };

export type LocalSearchType = {
  search: (str: string) => void;
  result: SearchState;
  nextResult: () => void;
};

const DEFAULT_PAGE_SIZE = 500;
const PRELOAD_POLL_INTERVALL = 20000;
const POSTLOAD_POLL_INTERVAL = 10000;

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
  const [postPoll, setPostPoll] = useState<boolean>(false);
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
          // Check if there was any new lines. If there wasnt, lets cancel post finish polling.
          if (result.data.length > 0 && logs.length > 0 && result.data[0].row === logs.length - 1) {
            setPostPoll(false);
          }

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

  // Fetch logs when task gets completed
  useEffect(() => {
    if (status === 'NotAsked' && !paused) {
      setStatus('Loading');

      fetchLogs(1, '-').then((result) => {
        setPostPoll(true);

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
    let t: number;
    if (['Ok', 'Error'].includes(preloadStatus) && paused) {
      t = window.setTimeout(() => {
        fetchPreload();
      }, PRELOAD_POLL_INTERVALL);
    }
    return () => {
      clearTimeout(t);
    };
  }, [preloadStatus, paused]); // eslint-disable-line

  // Post finish polling
  // In some cases all logs might not be there after task finishes. For this, lets poll new logs every 10sec until
  // there is no new lines
  useEffect(() => {
    let t: number;
    if (status === 'Ok' && postPoll) {
      t = window.setTimeout(() => {
        fetchLogs(1, '-');
      }, POSTLOAD_POLL_INTERVAL);
    }
    return () => {
      clearTimeout(t);
    };
  }, [status, postPoll, logs]); // eslint-disable-line

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

  const [searchResult, setSearchResult] = useState<SearchState>({
    active: false,
    result: [],
    current: 0,
    query: '',
  });

  function search(str: string) {
    if (!str) {
      return setSearchResult({ active: false, result: [], current: 0, query: '' });
    }
    const query = str.toLowerCase();
    const results = logs
      .filter(filterbySearchTerm)
      .filter((line) => line.line.toLowerCase().indexOf(query) > -1)
      .map((item) => {
        const index = item.line.toLowerCase().indexOf(query);
        return {
          line: item.row,
          char: [index, index + str.length] as [number, number],
        };
      });
    setSearchResult({ active: true, result: results, current: 0, query: str });
  }

  function nextResult() {
    if (searchResult.current === searchResult.result.length - 1) {
      setSearchResult((cur) => ({ ...cur, current: 0 }));
    } else {
      setSearchResult((cur) => ({ ...cur, current: cur.current + 1 }));
    }
  }

  // Clean up on url change
  useEffect(() => {
    setStatus('NotAsked');
    setPreloadStatus('NotAsked');
    setLogs([]);
    setError(null);
    setPostPoll(false);
    setSearchResult({ active: false, result: [], current: 0, query: '' });
  }, [url]); // eslint-disable-line

  return { logs, status, preloadStatus, error, loadMore, localSearch: { search, nextResult, result: searchResult } };
};

function filterbySearchTerm(item: LogItem): item is Log {
  return typeof item === 'object';
}

export default useLogData;
