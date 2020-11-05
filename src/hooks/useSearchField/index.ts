import { useEffect, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import useSearchRequest, { SearchResult, TaskMatch } from '../useSearchRequest';

export type SearchResultModel = {
  result: TaskMatch[];
  status: 'NotAsked' | 'Loading' | 'Ok' | 'Error';
};

export type SearchFieldProps = { text: string; setText: (str: string) => void };

export type SearchFieldReturnType = {
  results: SearchResultModel;
  fieldProps: SearchFieldProps;
};

const cache: { id: string; text: string; results: SearchResultModel } = {
  id: '',
  text: '',
  results: { result: [], status: 'NotAsked' },
};

function isCached(flowId: string, runNumber: string) {
  return flowId + runNumber === cache.id;
}

export default function useSeachField(flowID: string, runNumber: string): SearchFieldReturnType {
  const [qp, setQp] = useQueryParams({ q: StringParam });
  const [searchValue, setSearchValue] = useState(qp.q ? qp.q : isCached(flowID, runNumber) ? cache.text : '');
  const [searchResults, setSearchResults] = useState<SearchResultModel>(
    isCached(flowID, runNumber) ? cache.results : { result: [], status: 'NotAsked' },
  );

  const updateSearchResults = (newResults: SearchResultModel) => {
    setSearchResults(newResults);
    cache.results = newResults;
    cache.id = flowID + runNumber;
  };

  const updateText = (str: string) => {
    setSearchValue(str);
    setQp({ q: str });
    cache.text = str;
    cache.id = flowID + runNumber;
  };

  useSearchRequest({
    url: `/flows/${flowID}/runs/${runNumber}/search`,
    searchValue: searchValue,
    onUpdate: (event: SearchResult) => {
      if (Array.isArray(event.matches)) {
        updateSearchResults({ result: event.matches || [], status: 'Ok' });
      } else {
        updateSearchResults({ result: [], status: 'Ok' });
      }
    },
    onOpen: () => {
      updateSearchResults({ ...searchResults, status: 'Loading' });
    },
    onError: () => {
      updateSearchResults({ result: [], status: 'Error' });
    },
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
