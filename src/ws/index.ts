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

export interface Event<T> {
  type: EventType;
  resource: string;
  data: T;
}

export type OnUpdate<T> = (event: Event<T>) => void;
export type Unsubscribe = () => void;

const subscribeMessage = (resource: string) => {
  return { type: SubscribeType.SUBSCRIBE, resource: resource };
};

const unsubscribeMessage = (resource: string) => {
  return { type: SubscribeType.UNSUBSCRIBE, resource: resource };
};

type WebSocketConnection = {
  subscribe: <T>(resource: string, onUpdate: OnUpdate<T>) => Unsubscribe;
};

export function createWebsocketConnection(url: string): WebSocketConnection {
  const subscribers: Record<string, Array<OnUpdate<any>>> = {};

  const conn = new ReconnectingWebSocket(url, [], {});
  conn.addEventListener('open', (e) => {
    console.info('Wwebsocket connection open', e);
  });
  conn.addEventListener('close', (e) => {
    console.info('Wwebsocket connection closed', e);
  });
  conn.addEventListener('message', (e) => {
    if (e.data) {
      try {
        const event = JSON.parse(e.data) as Event<any>;
        emit(event);
      } catch (e) {
        console.error(e);
      }
    }
  });
  conn.addEventListener('error', (e) => {
    console.error('Wwebsocket error', e);
  });

  const emit = (event: Event<any>) => {
    if (subscribers[event.resource]) {
      subscribers[event.resource].forEach((onUpdate) => onUpdate(event));
    }
  };

  const subscribe: WebSocketConnection['subscribe'] = (resource, onUpdate) => {
    if (!subscribers[resource]) {
      subscribers[resource] = [];
    }

    const unsubscribe = () => {
      conn.send(JSON.stringify(unsubscribeMessage(resource)));
      subscribers[resource] = subscribers[resource].filter((item) => item !== onUpdate);
      return true;
    };

    // Always unsubscribe first to prevent duplicate event listeners
    unsubscribe() && subscribers[resource].push(onUpdate);

    conn.send(JSON.stringify(subscribeMessage(resource)));

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
