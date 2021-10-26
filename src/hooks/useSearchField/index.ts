import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParams } from 'use-query-params';
import useSearchRequest, { SearchResult, TaskMatch } from '../useSearchRequest';

//
// Typedef
//

export type SearchResultModel =
  | {
      result: TaskMatch[];
      status: 'NotAsked' | 'Loading' | 'Ok';
    }
  | {
      result: TaskMatch[];
      status: 'Error';
      errorMsg: string;
    };

export type SearchFieldProps = { text: string; setText: (str: string, forceUpdate?: boolean) => void };

export type SearchFieldReturnType = {
  results: SearchResultModel;
  fieldProps: SearchFieldProps;
};

//
// Datastore
// Cache search state since we might use same search field in multiple fields.
//

const cache: { id: string; text: string; results: SearchResultModel } = {
  id: '',
  text: '',
  results: { result: [], status: 'NotAsked' },
};

function isCached(flowId: string, runNumber: string) {
  return flowId + runNumber === cache.id;
}

//
// Hook
// Search hook will send artifact search requests with websocket. Every time user changes query we resubscribe to search
// websocket and backend will initiate search. These queries might take a while.
//
// Search query will return list of tasks that matched to query.
//

export default function useSeachField(flowID: string, runNumber: string): SearchFieldReturnType {
  const { t } = useTranslation();
  const [qp, setQp] = useQueryParams({ q: StringParam });
  const [searchValue, setSearchValue] = useState(qp.q ? qp.q : isCached(flowID, runNumber) ? cache.text : '');
  const [searchResults, setSearchResults] = useState<SearchResultModel>(
    isCached(flowID, runNumber) ? cache.results : { result: [], status: 'NotAsked' },
  );
  const [enabled, setEnabled] = useState(true);

  const updateSearchResults = (newResults: SearchResultModel) => {
    setSearchResults({
      ...newResults,
      // Only display items that were searchable, unsearchable result indicates error
      result: newResults.result.filter((r) => r.searchable),
    });
    cache.results = newResults;
    cache.id = flowID + runNumber;
  };

  const updateText = (str: string, forceUpdate?: boolean) => {
    setSearchValue(str);
    setQp({ q: str }, 'replaceIn');
    cache.text = str;
    cache.id = flowID + runNumber;

    if (forceUpdate) {
      setEnabled(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setEnabled(true);
    }
  }, [enabled]);

  useSearchRequest({
    url: `/flows/${flowID}/runs/${runNumber}/search`,
    searchValue: searchValue,
    onUpdate: (event: SearchResult) => {
      if (event.type === 'result' && Array.isArray(event.matches)) {
        updateSearchResults({ result: event.matches || [], status: 'Ok' });
      } else if (event.type === 'error' && event.message) {
        updateSearchResults({ status: 'Error', errorMsg: event.message, result: [] });
      } else {
        updateSearchResults({ result: [], status: 'Ok' });
      }
    },
    onConnecting: () => {
      updateSearchResults({ ...searchResults, status: 'Loading' });
    },
    onError: () => {
      updateSearchResults({ result: [], status: 'Error', errorMsg: t('search.failed-to-search') });
    },
    enabled: enabled,
  });

  useEffect(() => {
    if (searchValue === '') {
      setSearchResults({ result: [], status: 'NotAsked' });
    }
  }, [searchValue, setSearchResults]);

  useEffect(() => {
    if (qp.q) {
      cache.text = qp.q;
      cache.id = flowID + runNumber;
    }
  }, []); // eslint-disable-line

  return {
    results: searchResults,
    fieldProps: { text: searchValue, setText: updateText },
  };
}
