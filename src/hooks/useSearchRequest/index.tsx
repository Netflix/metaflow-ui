import useWebsocketRequest, { OnOpen, OnUpdate, OnClose, OnError } from '../useWebsocketRequest';

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

interface SearchKeyValuePair {
  key: string;
  value?: string;
}

const parseSearchValue = (searchValue: string): SearchKeyValuePair | null => {
  const components = (searchValue || '').trim().split(':').filter(Boolean);
  if (components.length > 0) {
    if (components[1]) {
      return { key: components[0], value: components[1] };
    }
    return { key: components[0] };
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
  const searchKv = parseSearchValue(searchValue);
  useWebsocketRequest<SearchResult>({
    url,
    queryParams: searchKv !== null ? (searchKv as unknown as Record<string, string>) : {},
    enabled: searchKv !== null && enabled,
    onConnecting,
    onUpdate,
    onClose,
    onError,
    onOpen,
  });
}
