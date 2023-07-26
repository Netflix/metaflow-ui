import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParams } from 'use-query-params';
import useSearchRequest, { SearchResult, TaskMatch } from '../useSearchRequest';

const notAskedSearchResults: SearchResultModel = { result: [], status: 'NotAsked' };
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
  results: notAskedSearchResults,
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

export default function useSearchField(flowID: string, runNumber: string): SearchFieldReturnType {
  const { t } = useTranslation();
  const [qp, setQp] = useQueryParams({ q: StringParam });
  const [searchValue, setSearchValue] = useState(qp.q ? qp.q : isCached(flowID, runNumber) ? cache.text : '');
  const [searchResults, setSearchResults] = useState<SearchResultModel>(
    isCached(flowID, runNumber) ? cache.results : notAskedSearchResults,
  );
  const [enabled, setEnabled] = useState(true);

  const updateSearchResults = useCallback(
    (newResults: SearchResultModel) => {
      setSearchResults({
        ...newResults,
        // Only display items that were searchable, unsearchable result indicates error
        result: newResults.result.filter((r) => r.searchable),
      });
      cache.results = newResults;
      cache.id = flowID + runNumber;
    },
    [flowID, runNumber],
  );

  const updateText = useCallback(
    (str: string, forceUpdate?: boolean) => {
      setSearchValue(str);
      setQp({ q: str }, 'replaceIn');
      cache.text = str;
      cache.id = flowID + runNumber;

      if (forceUpdate) {
        setEnabled(false);
      }
    },
    [setQp, runNumber, flowID],
  );

  useEffect(() => {
    if (!enabled) {
      setEnabled(true);
    }
  }, [enabled]);

  const onError = useCallback(() => {
    updateSearchResults({ result: [], status: 'Error', errorMsg: t('search.failed-to-search') });
  }, [t, updateSearchResults]);

  const onUpdate = useCallback(
    (event: SearchResult) => {
      if (event.type === 'result' && Array.isArray(event.matches)) {
        updateSearchResults({ result: event.matches || [], status: 'Ok' });
      } else if (event.type === 'error' && event.message) {
        updateSearchResults({ status: 'Error', errorMsg: event.message, result: [] });
      }
    },
    [updateSearchResults],
  );

  const onConnecting = useCallback(() => {
    // if (searchResults.status !== 'Loading') {
    //   updateSearchResults({ ...searchResults, status: 'Loading' });
    // }

    setSearchResults((existingSearchResults) => {
      cache.results = { ...existingSearchResults, status: 'Loading' };
      cache.id = flowID + runNumber;
      return {
        ...existingSearchResults,
        status: 'Loading',
        // Only display items that were searchable, unsearchable result indicates error
        result: existingSearchResults.result.filter((r) => r.searchable),
      };
    });
  }, [flowID, runNumber]);

  useSearchRequest({
    url: `/flows/${flowID}/runs/${runNumber}/search`,
    searchValue: searchValue,
    onUpdate,
    onConnecting,
    onError,
    enabled,
  });

  useEffect(() => {
    if (searchValue === '') {
      setSearchResults(notAskedSearchResults);
    }
  }, [searchValue, setSearchResults]);

  useEffect(() => {
    if (qp.q) {
      cache.text = qp.q;
      cache.id = flowID + runNumber;
    }
  }, [qp.q, flowID, runNumber]);

  return useMemo(
    () => ({
      results: searchResults,
      fieldProps: { text: searchValue, setText: updateText },
    }),
    [searchResults, searchValue, updateText],
  );
}
