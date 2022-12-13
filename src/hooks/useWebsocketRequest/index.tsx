import ReconnectingWebSocket, { Event as OpenEvent, CloseEvent, ErrorEvent } from 'reconnecting-websocket';

import { apiWs } from '../../constants';

import { useEffect } from 'react';

export interface Event<T> {
  event: T;
}

export type OnOpen = (event: OpenEvent) => void;
export type OnUpdate<T> = (event: T) => void;
export type OnClose = (event: CloseEvent) => void;
export type OnError = (event: ErrorEvent) => void;
export type OnStart = () => void;

export interface HookConfig<T> {
  url: string;
  queryParams?: Record<string, string>;
  enabled?: boolean;
  onConnecting?: () => void;
  onOpen?: OnOpen;
  onUpdate: OnUpdate<T>;
  onClose?: OnClose;
  onError?: OnError;
}

export default function useWebsocketRequest<T>({
  url,
  queryParams = {},
  enabled = true,
  onConnecting,
  onOpen,
  onUpdate,
  onClose,
  onError,
}: HookConfig<T>): void {
  const qs = new URLSearchParams(queryParams).toString();

  useEffect(() => {
    let conn: ReconnectingWebSocket;

    const _onOpen = (e: OpenEvent) => {
      onOpen && onOpen(e);
    };
    const _onClose = (e: CloseEvent) => {
      onClose && onClose(e);
    };
    const _onMessage = (e: MessageEvent) => {
      if (e.data) {
        try {
          const event = JSON.parse(e.data) as Event<T>;
          onUpdate(event.event);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const _onError = (e: ErrorEvent) => {
      console.error('Websocket connection error', e);
      onError && onError(e);
    };

    if (enabled) {
      const q = new URLSearchParams(queryParams).toString();
      const target = `${url}${q ? '?' + q : ''}`;

      onConnecting && onConnecting();

      conn = new ReconnectingWebSocket(apiWs(target), [], { maxRetries: 0 });

      conn.addEventListener('open', _onOpen);
      conn.addEventListener('close', _onClose);
      conn.addEventListener('message', _onMessage);
      conn.addEventListener('error', _onError);
    }

    return () => {
      if (conn) {
        conn.removeEventListener('open', _onOpen);
        conn.removeEventListener('close', _onClose);
        conn.removeEventListener('message', _onMessage);
        conn.removeEventListener('error', _onError);

        conn.close();
      }
    };
  }, [url, qs, enabled, onClose, onError, onOpen, onUpdate, onConnecting, queryParams]);
}
