import ReconnectingWebSocket, { Event as WSEvent, CloseEvent, ErrorEvent } from 'reconnecting-websocket';
import { WebSocketEventListenerMap } from 'reconnecting-websocket/events';
import { apiWs } from '@/constants';
import { setLogItem } from '@utils/debugdb';

enum SubscribeType {
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
}

export enum EventType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface Subscription<T> {
  uuid: string;
  resource: string;
  onUpdate: OnUpdate<T>;
}

export interface Event<T> {
  type: EventType;
  uuid: string;
  resource: string;
  data: T;
}

export type OnUpdate<T> = (event: Event<T>) => void;
export type OnReconnect = (lastConnectedTime: Date) => void;
export type Unsubscribe = () => void;

const subscribeMessage = (uuid: string, resource: string, since?: number | null) => {
  return { type: SubscribeType.SUBSCRIBE, uuid, resource, since: since ? since : undefined };
};

const unsubscribeMessage = (uuid: string) => {
  return { type: SubscribeType.UNSUBSCRIBE, uuid };
};

type WebSocketConnection = {
  subscribe: <T>(
    uuid: string,
    resource: string,
    queryParams: Record<string, string>,
    onUpdate: OnUpdate<T>,
  ) => Unsubscribe;
  addEventListener<T extends keyof WebSocketEventListenerMap>(type: T, listener: WebSocketEventListenerMap[T]): void;
  removeEventListener<T extends keyof WebSocketEventListenerMap>(type: T, listener: WebSocketEventListenerMap[T]): void;
};

export function createWebsocketConnection(url: string): WebSocketConnection {
  let subscriptions: Array<Subscription<unknown>> = [];

  let connectedSinceUnixTime: number | null = null;

  const conn = new ReconnectingWebSocket(url, [], {
    maxReconnectionDelay: 5000, // max delay in ms between reconnections
    minReconnectionDelay: 1000, // min delay in ms between reconnections
    reconnectionDelayGrowFactor: 1.05, // how fast the reconnection delay grows
    minUptime: 5000, // min time in ms to consider connection as stable
    connectionTimeout: 2000, // retry connect if not connected after this time, in ms
    maxRetries: Infinity, // maximum number of retries
    maxEnqueuedMessages: Infinity, // maximum number of messages to buffer until reconnection
    startClosed: false, // start websocket in CLOSED state, call `.reconnect()` to connect
    debug: false, // enables debug output
  });

  // Connection health check functions
  let pingTimer = 0;
  let pingInterval = 0;
  // Send ping for backend, expect to get answer in less than 5s or close connection
  function ping() {
    conn.send('__ping__');
    setLogItem('Websocket ping sent');
    pingTimer = window.setTimeout(() => {
      conn.reconnect();
    }, 2000);
  }
  function pong() {
    setLogItem('Websocket pong received, connection ok!');
    clearTimeout(pingTimer);
  }

  conn.addEventListener('open', (_e: WSEvent) => {
    setLogItem('Websocket connection opened');
    // Always re-subscribe to events when connection is established
    // This operation is safe since backend makes sure there's no duplicate identifiers
    subscriptions.forEach((subscription) => {
      conn.send(JSON.stringify(subscribeMessage(subscription.uuid, subscription.resource, connectedSinceUnixTime)));
    });

    // Reset `connectedSinceUnixTime` so that next disconnect timestamp can be recorder
    connectedSinceUnixTime = null;
    // Setup ping sending interval
    pingInterval = window.setInterval(ping, 5000);
  });
  conn.addEventListener('close', (_e: CloseEvent) => {
    setLogItem('Websocket connection closed');
    if (!connectedSinceUnixTime) {
      // This timestamp will be used to define gap between realtime data
      // Once connection is re-established the missing data will be returned to client
      connectedSinceUnixTime = Math.floor(new Date().getTime() / 1000);
    }

    if (_e.code !== 1000) {
      setLogItem('Websocket connection closed with error');
      console.log('Websocket closed with error');
    }
    // Clear connection ping pongs
    clearInterval(pingInterval);
    clearTimeout(pingTimer);
  });
  conn.addEventListener('message', (e: MessageEvent) => {
    setLogItem(`Websocket message: ${e.data}`);
    if (e.data) {
      // Check if we are getting answer for our ping.
      if (e.data === '__pong__') {
        pong();
        return;
      }
      try {
        const event = JSON.parse(e.data) as Event<unknown>;
        emit(event);
      } catch (e) {
        console.error(e);
      }
    }
  });
  conn.addEventListener('error', (e: ErrorEvent) => {
    console.error('Websocket error', e);
  });

  const emit = (event: Event<unknown>) => {
    subscriptions.forEach((subscription) => {
      if (event.uuid === subscription.uuid) {
        subscription.onUpdate(event);
      }
    });
  };

  const subscribe: WebSocketConnection['subscribe'] = (uuid, resource, queryParams, onUpdate) => {
    const q = new URLSearchParams(queryParams).toString();
    const target = `${resource}${q ? '?' + q : ''}`;

    const unsubscribe = () => {
      conn.send(JSON.stringify(unsubscribeMessage(uuid)));
      subscriptions = subscriptions.filter((subscription) => uuid !== subscription.uuid);
      return true;
    };

    // Always unsubscribe first to prevent duplicate event listeners
    unsubscribe() && subscriptions.push({ uuid, resource: target, onUpdate: onUpdate as OnUpdate<unknown> });

    conn.send(JSON.stringify(subscribeMessage(uuid, target)));

    // Finally return unsubscribe method
    return unsubscribe;
  };

  const addEventListener = <T extends keyof WebSocketEventListenerMap>(
    type: T,
    listener: WebSocketEventListenerMap[T],
  ) => conn.addEventListener(type, listener);
  const removeEventListener = <T extends keyof WebSocketEventListenerMap>(
    type: T,
    listener: WebSocketEventListenerMap[T],
  ) => conn.removeEventListener(type, listener);

  return {
    subscribe,
    addEventListener,
    removeEventListener,
  };
}

const ResourceEvents = createWebsocketConnection(apiWs('/ws'));

// Export
export default ResourceEvents;
