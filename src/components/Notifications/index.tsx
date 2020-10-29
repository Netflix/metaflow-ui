/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { v4 as generateIdentifier } from 'uuid';
import styled from 'styled-components';
import Icon, { SupportedIcons } from '../Icon';

/**
 * Usage example:
 * 

const ComponentWithNotifications = () => {
  const { addNotification } = useNotifications();

  return (
    <div
      onClick={() =>
        addNotification({
          type: NotificationType.Default,
          message: 'This is a notification',
        })
      }
    >
      Click me
    </div>
  );
};

*/

export enum NotificationType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

const NotificationIcon: Record<string, keyof SupportedIcons> = {
  [NotificationType.Success]: 'success',
  [NotificationType.Info]: 'info',
  [NotificationType.Danger]: 'danger',
  [NotificationType.Warning]: 'warning',
};

export interface Notification {
  uuid?: string;
  type: NotificationType;
  message: string;
}

interface IContextProps {
  notifications: Notification[];
  addNotification: (...notification: Notification[]) => void;
  removeNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}
export const NotificationsContext = React.createContext({} as IContextProps);

const MAX_NOTIFICATIONS = 5;

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = (notification: Notification) =>
    setNotifications((ns) => ns.filter((n) => n.uuid !== notification.uuid));

  const addNotification = (...notification: Notification[]) => {
    const notificationsToAdd = notification
      .map((n) => {
        return { uuid: n.uuid || generateIdentifier(), ...n };
      })
      .reverse();

    // Remove incoming notifications from existing notifications
    const existingNotifications = notifications.filter((a) => !notificationsToAdd.some((b) => a.uuid === b.uuid));

    setNotifications([...notificationsToAdd, ...existingNotifications].slice(0, MAX_NOTIFICATIONS));
    return notificationsToAdd;
  };

  const clearNotifications = () => setNotifications([]);

  const contextValue = {
    notifications,
    addNotification: useCallback((...notification) => addNotification(...notification), [addNotification]),
    removeNotification: useCallback((notification) => removeNotification(notification), [removeNotification]),
    clearNotifications: useCallback(() => clearNotifications(), [clearNotifications]),
  };

  return <NotificationsContext.Provider value={contextValue}>{children}</NotificationsContext.Provider>;
};

export function useNotifications(): IContextProps {
  const { notifications, addNotification, removeNotification, clearNotifications } = useContext(NotificationsContext);
  return { notifications, addNotification, removeNotification, clearNotifications };
}

// Notification lifecycle
enum NotificationState {
  // Mounted BUT not visible. Should turn to visible almost right away (Hidden)
  Mounted,
  // Normal visible (animating in)
  Visible,
  // Removing, but data still exists. (animating out)
  Removed,
}

export const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  // Lifecycle state of unique notifications
  const [notificationState, setNotificationState] = useState<Record<string, NotificationState>>({});

  const onRemove = (n: Notification) => {
    // Set notification state as removed. This won't remove notification data yet, but will notify rendering to animate
    // notification out.
    setNotificationState((states) =>
      n.uuid && states[n.uuid] === NotificationState.Visible
        ? { ...states, [n.uuid]: NotificationState.Removed }
        : states,
    );
    // After some time remove notification for real
    setTimeout(() => {
      removeNotification(n);
      // Also remove state of notification since its not needed anymore
      setNotificationState((states) =>
        n.uuid && states[n.uuid]
          ? Object.keys(states).reduce((obj: Record<string, NotificationState>, key) => {
              if (key === n.uuid) {
                return obj;
              }
              return { ...obj, [key]: states[key] };
            }, {})
          : states,
      );
    }, 300);
  };

  const onMountNotification = (n: Notification) => {
    // Create notification lifecycle state when notification has mounted for first time.
    setNotificationState((states) =>
      n.uuid && !states[n.uuid] ? { ...states, [n.uuid]: NotificationState.Visible } : states,
    );
    setTimeout(() => onRemove(n), 1000);
  };

  return (
    <NotificationsWrapper>
      {(notifications || []).map((notification: Notification) => {
        return (
          <NotificationRenderer
            notification={notification}
            removeNotification={removeNotification}
            state={
              notification.uuid && notificationState[notification.uuid]
                ? notificationState[notification.uuid]
                : NotificationState.Mounted
            }
            onMount={onMountNotification}
            key={notification.uuid}
          />
        );
      })}
    </NotificationsWrapper>
  );
};

const NotificationRenderer: React.FC<{
  notification: Notification;
  removeNotification: (notification: Notification) => void;
  onMount: (n: Notification) => void;
  state: NotificationState;
}> = ({ notification, removeNotification, onMount, state }) => {
  const iconName = NotificationIcon[notification.type];

  // Let's notify parent that notification is mounted for first time and is ready to appear
  useEffect(() => {
    // But lets do this only when state is unkown since this effect also triggers if index of notification
    // changes.
    if (state === NotificationState.Mounted) {
      onMount(notification);
    }
  }, []);

  return (
    <NotificationWrapper
      type={notification.type}
      state={state || NotificationState.Mounted}
      onClick={() => {
        removeNotification(notification);
      }}
    >
      {iconName && <Icon name={iconName} size="md" />}
      <NotificationMessage>{notification.message}</NotificationMessage>
    </NotificationWrapper>
  );
};

const NotificationsWrapper = styled.div`
  z-index: 99999;
  position: fixed;
  top: ${(p) => p.theme.spacer.md}rem;
  right: ${(p) => p.theme.spacer.md}rem;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
`;

const NotificationWrapper = styled.div<{ type: NotificationType; state: NotificationState }>`
  display: flex;
  align-items: center;
  padding: ${(p) => p.theme.spacer.md}rem;
  margin: ${(p) => p.theme.spacer.xs}rem;
  border-radius: 0.5rem;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].fg};
  cursor: pointer;
  opacity: ${(p) => (p.state === NotificationState.Visible ? '1' : '0')};
  transition: ${(p) => (p.state === NotificationState.Mounted ? 'none' : 'all 0.25s')};
`;

const NotificationMessage = styled.span`
  margin-left: ${(p) => p.theme.spacer.sm}rem;
`;
