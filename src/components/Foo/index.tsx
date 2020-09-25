import React, { useState, useCallback, useContext } from 'react';
import styled from 'styled-components';

export enum NotificationType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

interface Notification {
  type: NotificationType;
  message: string;
}

interface IContextProps {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}
export const NotificationsContext = React.createContext({} as IContextProps);

const MAX_NOTIFICATIONS = 5;

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = (notification: Notification) =>
    setNotifications(notifications.filter((n) => n !== notification));
  const addNotification = (notification: Notification) =>
    setNotifications([notification, ...notifications].slice(0, MAX_NOTIFICATIONS));
  const clearNotifications = () => setNotifications([]);

  const contextValue = {
    notifications,
    addNotification: useCallback((notification) => addNotification(notification), [addNotification]),
    removeNotification: useCallback((notification) => removeNotification(notification), [removeNotification]),
    clearNotifications: useCallback(() => clearNotifications(), [clearNotifications]),
  };

  return <NotificationsContext.Provider value={contextValue}>{children}</NotificationsContext.Provider>;
};

export function useNotifications(): IContextProps {
  const { notifications, addNotification, removeNotification, clearNotifications } = useContext(NotificationsContext);
  return { notifications, addNotification, removeNotification, clearNotifications };
}

export const Notifications: React.FC = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();

  return (
    <NotificationsWrapper>
      <span
        onClick={() => {
          addNotification({ type: NotificationType.Warning, message: `ugfks ${new Date().toString()}` });
        }}
      >
        Add
      </span>
      <span
        onClick={() => {
          clearNotifications();
        }}
      >
        Clear
      </span>

      {(notifications || []).map((notification: Notification) => {
        return (
          <NotificationWrapper
            key={notification.message}
            type={notification.type}
            onClick={() => {
              removeNotification(notification);
            }}
          >
            {notification.message}
          </NotificationWrapper>
        );
      })}
    </NotificationsWrapper>
  );
};

const NotificationsWrapper = styled.div`
  z-index: 999999;
  position: absolute;
  top: ${(p) => p.theme.spacer.md}rem;
  right: ${(p) => p.theme.spacer.md}rem;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
`;

const NotificationWrapper = styled.div<{ type: NotificationType }>`
  padding: ${(p) => p.theme.spacer.md}rem;
  margin: ${(p) => p.theme.spacer.xs}rem;
  border-radius: 0.5rem;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].text};
  background-color: #f1f1f1;
  cursor: pointer;
`;
