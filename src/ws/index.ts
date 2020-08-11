import ReconnectingWebSocket from 'reconnecting-websocket';
import { METAFLOW_SERVICE_WS } from '../constants';

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
export type Unsubscribe = () => void;

const subscribeMessage = (uuid: string, resource: string) => {
  return { type: SubscribeType.SUBSCRIBE, uuid, resource };
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
};

export function createWebsocketConnection(url: string): WebSocketConnection {
  let subscriptions: Array<Subscription<unknown>> = [];

  const conn = new ReconnectingWebSocket(url, [], {});
  conn.addEventListener('open', (_e) => {
    console.info('Websocket connection open');

    // Always re-subscribe to events when connection is established
    // This operation is safe since backend makes sure there's no duplicate identifiers
    subscriptions.forEach((subscription) => {
      conn.send(JSON.stringify(subscribeMessage(subscription.uuid, subscription.resource)));
    });
  });
  conn.addEventListener('close', (_e) => {
    console.info('Websocket connection closed');
  });
  conn.addEventListener('message', (e) => {
    if (e.data) {
      try {
        const event = JSON.parse(e.data) as Event<unknown>;
        emit(event);
      } catch (e) {
        console.error(e);
      }
    }
  });
  conn.addEventListener('error', (e) => {
    console.error('Websocket error', e);
  });

  const emit = (event: Event<unknown>) => {
    subscriptions.forEach((subscription) => {
      if (event.resource === subscription.resource && event.uuid === subscription.uuid) {
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
    unsubscribe() && subscriptions.push({ uuid, resource, onUpdate: onUpdate as OnUpdate<unknown> });

    conn.send(JSON.stringify(subscribeMessage(uuid, target)));

    // Finally return unsubscribe method
    return unsubscribe;
  };

  return {
    subscribe,
  };
}

const ResourceEvents = createWebsocketConnection(METAFLOW_SERVICE_WS);

// Export
export default ResourceEvents;
