import { useMemo } from 'react';
import FEATURE_FLAGS from '@utils/FEATURE';
import useWebsocketRequest, { OnClose, OnError, OnOpen, OnUpdate } from '../useWebsocketRequest';

export type SearchResult =
  | {
      progress?: string;
      matches?: Match[];
      type: 'result';
    }
  | {
      type: 'error';
      message: string;
      traceback?: string;
      id: string;
    };

interface MatchError {
  id: string;
  detail: string;
}

interface Match {
  flow_id: string;
  run_number: string;
  searchable: boolean;
  step_name: string;
  task_id: string;
  error?: MatchError;
}

export type TaskMatch = Match;

export interface HookConfig {
  url: string;
  searchValue: string;
  onConnecting?: () => void;
  onOpen?: OnOpen;
  onUpdate: OnUpdate<SearchResult>;
  onClose?: OnClose;
  onError?: OnError;
  enabled?: boolean;
}

interface SearchTerm {
  key: string;
  scope: string;
  value?: string;
}

enum SearchScope {
  Artifact = 'ARTIFACT',
  ForeachVariable = 'FOREACH_VARIABLE',
}

export const parseSearchValue = (searchValue: string): SearchTerm | null => {
  const scope: string[] = [];
  if (FEATURE_FLAGS.ARTIFACT_SEARCH) {
    scope.push(SearchScope.Artifact);
  }
  if (FEATURE_FLAGS.FOREACH_VAR_SEARCH) {
    scope.push(SearchScope.ForeachVariable);
  }

  const components = (searchValue || '').trim().split(':').filter(Boolean);
  if (components.length > 0) {
    if (components[1]) {
      return { key: components[0], value: components[1], scope: scope.join(',') };
    }
    return { key: components[0], scope: scope.join(',') };
  }
  return null;
};

export default function useSearchRequest({
  url,
  searchValue = '',
  onConnecting,
  onUpdate,
  onClose,
  onError,
  onOpen,
  enabled = true,
}: HookConfig): void {
  const searchTerm = useMemo(() => {
    return parseSearchValue(searchValue);
  }, [searchValue]);

  useWebsocketRequest<SearchResult>({
    url,
    queryParams: searchTerm !== null ? (searchTerm as unknown as Record<string, string>) : {},
    enabled: searchTerm !== null && enabled,
    onConnecting,
    onUpdate,
    onClose,
    onError,
    onOpen,
  });
}
