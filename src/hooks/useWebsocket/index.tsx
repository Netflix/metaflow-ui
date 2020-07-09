import { useEffect } from 'react';
import ResourceEvents, { OnUpdate } from '../../ws';
import { v4 as generateIdentifier } from 'uuid';

export interface HookConfig<T> {
  url: string;
  queryParams?: Record<string, string>;
  enabled?: boolean;
  uuid?: string;
  onUpdate: OnUpdate<T>;
}

export default function useWebsocket<T>({
  url,
  queryParams = {},
  enabled = true,
  uuid,
  onUpdate,
}: HookConfig<T>): void {
  const uniqueId = uuid || generateIdentifier();
  const resource = new URL(url, document.baseURI).pathname;

  useEffect(() => {
    const unsubWebsocket = enabled && ResourceEvents.subscribe(uniqueId, resource, queryParams, onUpdate);
    return () => {
      unsubWebsocket && unsubWebsocket();
    };
  }, [url, queryParams]); // eslint-disable-line
}
