import { useEffect, useState } from 'react';
import { AsyncStatus } from '../../types';
import { apiHttp } from '../../constants';

//
// Typedef
//
export type AutoCompleteItem = { value: string; label: string };

export type AutoCompleteSettings<T> = {
  url: string;
  // Parse incoming data to autocomplete items;
  parser?: (item: T) => AutoCompleteItem;
  finder?: (item: AutoCompleteItem, input: string) => boolean;
  preFetch?: boolean;
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

function useAutoComplete<T>({ preFetch, url, input, parser, finder }: AutoCompleteParameters<T>): AutoCompleteResult {
  const [result, setResult] = useState<AutoCompleteResult>(
    DataStore[url] ? DataStore[url] : { status: 'NotAsked', data: [], timestamp: 0 },
  );

  function updateResult() {
    const newResults = DataStore[url].data.filter((item) =>
      finder ? finder(item, input) : item.value.includes(input),
    );
    setResult({
      status: DataStore[url]?.status || 'NotAsked',
      data: newResults,
      timestamp: DataStore[url]?.timestamp || 0,
    });
  }

  // Initialise caching
  useEffect(() => {
    if (!DataStore[url]) {
      DataStore[url] = { status: 'NotAsked', data: [], timestamp: 0 };
    }
  }, [url]); // eslint-disable-line

  useEffect(() => {
    if (preFetch) {
      if (DataStore[url]?.status !== 'NotAsked' && Date.now() - DataStore[url]?.timestamp < TIME_TO_REFETCH) {
        updateResult();
      } else {
        DataStore[url] = { status: 'Loading', data: [], timestamp: Date.now() };
        // fetch
        fetch(apiHttp(url))
          .then((resp) => resp.json())
          .then((response) => {
            if (Array.isArray(response) || Array.isArray(response.data)) {
              DataStore[url] = {
                status: 'Ok',
                timestamp: Date.now(),
                data: (Array.isArray(response) ? response : response.data).map(
                  parser || ((item: T) => ({ label: item, value: item })),
                ),
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
      // NOTE: This cannot work without some kind of debouncing
      fetch(url)
        .then((resp) => resp.json())
        .then((response) => {
          if (response.status === 200 && Array.isArray(response.data)) {
            setResult({ status: 'Ok', data: response.data.map(parser), timestamp: Date.now() });
          } else {
            setResult({ status: 'Error', data: [], timestamp: Date.now() });
          }
        });
    }
  }, [input, url, preFetch]); // eslint-disable-line

  return result;
}

export default useAutoComplete;
