import { useEffect, useState } from 'react';
import ResourceEvents, { OnUpdate, OnReconnect } from '../../ws';
import { v4 as generateIdentifier } from 'uuid';

export interface HookConfig<T> {
  url: string;
  queryParams?: Record<string, string>;
  enabled?: boolean;
  uuid?: string;
  onUpdate: OnUpdate<T>;
  onReconnect?: OnReconnect;
}

export default function useWebsocket<T>({
  url,
  queryParams = {},
  enabled = true,
  uuid,
  onUpdate,
  onReconnect,
}: HookConfig<T>): void {
  const uniqueId = uuid || generateIdentifier();
  const resource = new URL(url, document.baseURI).pathname;
  const qs = new URLSearchParams(queryParams).toString();

  const [lastConnectedTime, setLastConnectedTime] = useState<Date | null>(null);

  useEffect(() => {
    const onOpen = () => {
      if (onReconnect && lastConnectedTime) {
        onReconnect(lastConnectedTime);
        setLastConnectedTime(null);
      }
    };

    const onClose = () => {
      if (!lastConnectedTime) {
        setLastConnectedTime(new Date());
      }
    };

    ResourceEvents.addEventListener('open', onOpen);
    ResourceEvents.addEventListener('close', onClose);

    return () => {
      ResourceEvents.removeEventListener('open', onOpen);
      ResourceEvents.removeEventListener('close', onClose);
    };
  });

  useEffect(() => {
    const unsubWebsocket = enabled && ResourceEvents.subscribe(uniqueId, resource, queryParams, onUpdate);
    return () => {
      unsubWebsocket && unsubWebsocket();
    };
  }, [url, qs, enabled]); // eslint-disable-line
}
