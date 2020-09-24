import useWebsocketRequest, { OnOpen, OnUpdate, OnClose, OnError } from '../useWebsocketRequest';

export interface SearchResult {
  progress?: string;
  matches?: Match[];
}

interface Match {
  flow_id: string;
  run_number: string;
  searchable: boolean;
  step_name: string;
  task_id: string;
}

export type TaskMatch = Match;

export interface HookConfig {
  url: string;
  searchValue: string;
  onOpen?: OnOpen;
  onUpdate: OnUpdate<SearchResult>;
  onClose?: OnClose;
  onError?: OnError;
}

interface SearchKeyValuePair {
  key: string;
  value: string;
}

const parseSearchValue = (searchValue: string): SearchKeyValuePair | null => {
  const components = (searchValue || '').trim().split(/\s+/).filter(Boolean);
  if (components.length > 0) {
    const condition = components[0].split('=');
    if (condition.length === 2 && condition[0] && condition[1]) {
      return { key: condition[0], value: condition[1] };
    }
  }
  return null;
};

export default function useSearchRequest({
  url,
  searchValue = '',
  onUpdate,
  onClose,
  onError,
  onOpen,
}: HookConfig): void {
  const searchKv = parseSearchValue(searchValue);
  useWebsocketRequest<SearchResult>({
    url,
    queryParams: searchKv !== null ? { key: searchKv.key, value: searchKv.value } : {},
    enabled: searchKv !== null,
    onUpdate,
    onClose,
    onError,
    onOpen,
  });
}
