import { useCallback, useEffect, useMemo, useState } from 'react';
import { AsyncStatus } from '../../types';
import { apiHttp } from '../../constants';
import { useDebounce } from 'use-debounce/lib';

//
// Typedef
//
export type AutoCompleteItem = { value: string; label: string };

export type AutoCompleteSettings<T> = {
  url: string;
  params?: Record<string, string>;
  // Parse incoming data to autocomplete items;
  parser?: (item: T) => AutoCompleteItem;
  // Custom function to find results from dataset
  finder?: (item: AutoCompleteItem, input: string) => boolean;
  // preFetch = true sets mode so we use cache and send only single query. This might be slower initially but after that request autocomplete works really fast.
  preFetch?: boolean;
  // Flag if we should send request with empty input
  searchEmpty?: boolean;
  enabled?: boolean;
};

export type AutoCompleteParameters<T> = {
  input: string;
} & AutoCompleteSettings<T>;

export type AutoCompleteResult = { data: AutoCompleteItem[]; status: AsyncStatus; timestamp: number };

//
// Datastore
//

const DataStore: Record<string, AutoCompleteResult> = {};

//
// Hook
//

// Let's refetch every 20 seconds for now
const TIME_TO_REFETCH = 20000;

const DEFAULT_PARAMS = {
  _limit: '5',
};

function useAutoComplete<T>({
  preFetch,
  url: rawUrl,
  params = {},
  input,
  parser,
  finder,
  searchEmpty = false,
  enabled = true,
}: AutoCompleteParameters<T>): { result: AutoCompleteResult; reset: () => void; refetch: () => void } {
  const qparams = new URLSearchParams({ ...DEFAULT_PARAMS, ...params }).toString();
  const requestUrl = apiHttp(`${rawUrl}${qparams ? '?' + qparams : ''}`);

  const [refetcher, setRefetcher] = useState(0);
  const [url] = useDebounce(requestUrl, preFetch ? 0 : 300);

  const [result, setResult] = useState<AutoCompleteResult>(
    DataStore[url] ? DataStore[url] : { status: 'NotAsked', data: [], timestamp: 0 },
  );

  const updateResult = useCallback(() => {
    const newResults = DataStore[url].data.filter((item) =>
      finder ? finder(item, input) : item.value.toLocaleLowerCase().includes(input.toLowerCase()),
    );
    setResult({
      status: DataStore[url]?.status || 'NotAsked',
      data: newResults,
      timestamp: DataStore[url]?.timestamp || 0,
    });
  }, [finder, input, url]);

  // Initialise caching
  useEffect(() => {
    if (!DataStore[url] && preFetch) {
      DataStore[url] = { status: 'NotAsked', data: [], timestamp: 0 };
    }
  }, [url, preFetch]);

  // Update results when input changes on prefetch
  useEffect(() => {
    if (input && preFetch) {
      updateResult();
    }
  }, [preFetch, input, updateResult]);

  const abortCtrl = useMemo(() => new AbortController(), []);

  useEffect(() => {
    if (DataStore[url] && DataStore[url].status === 'Loading') {
      abortCtrl.abort();
    }
  }, [requestUrl, abortCtrl, url]);

  useEffect(() => {
    if ((!searchEmpty && !input) || !enabled) return;

    const parseResult = parser || ((item: T) => ({ label: item, value: item }));

    if (preFetch) {
      if (DataStore[url]?.status !== 'NotAsked' && Date.now() - DataStore[url]?.timestamp < TIME_TO_REFETCH) {
        updateResult();
      } else {
        DataStore[url] = { status: 'Loading', data: [], timestamp: Date.now() };

        // fetch
        fetch(url, { signal: abortCtrl.signal })
          .then((resp) => resp.json())
          .then((response) => {
            if (Array.isArray(response) || Array.isArray(response.data)) {
              DataStore[url] = {
                status: 'Ok',
                timestamp: Date.now(),
                data: (Array.isArray(response) ? response : response.data).map(parseResult),
              };
            } else {
              DataStore[url] = { status: 'Error', data: [], timestamp: Date.now() };
            }
            updateResult();
          })
          .catch(() => {
            DataStore[url] = { status: 'Error', data: [], timestamp: Date.now() };
          });
      }
    } else {
      fetch(url, { signal: abortCtrl.signal })
        .then((resp) => resp.json())
        .then((response) => {
          if (response.status === 200 && Array.isArray(response.data)) {
            const data: AutoCompleteItem[] = response.data.map(parseResult);
            setResult({
              status: 'Ok',
              data: finder ? data.filter((item) => finder(item, input)) : data,
              timestamp: Date.now(),
            });
          } else {
            setResult({ status: 'Error', data: [], timestamp: Date.now() });
          }
        })
        .catch(() => {
          setResult({ status: 'Error', data: [], timestamp: Date.now() });
        });
    }
    return () => {
      abortCtrl.abort();
    };
  }, [url, preFetch, searchEmpty, refetcher, abortCtrl, input, enabled, finder, parser, updateResult]);

  return {
    result,
    reset() {
      setResult({ status: 'NotAsked', data: [], timestamp: 0 });
    },
    refetch() {
      setRefetcher((num) => num + 1);
    },
  };
}

export default useAutoComplete;
