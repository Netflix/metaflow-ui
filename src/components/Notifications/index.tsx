/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useContext } from 'react';
import { v4 as generateIdentifier } from 'uuid';
import styled from 'styled-components';
import Icon, { SupportedIcons } from '../Icon';

export enum NotificationType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

const NotificationIcon: Record<string, keyof SupportedIcons> = {
  [NotificationType.Danger]: 'danger',
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
    setNotifications(notifications.filter((n) => n.uuid !== notification.uuid));

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

export const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <NotificationsWrapper>
      {(notifications || []).map((notification: Notification) => {
        const iconName = NotificationIcon[notification.type];
        return (
          <NotificationWrapper
            key={notification.uuid}
            type={notification.type}
            onClick={() => {
              removeNotification(notification);
            }}
          >
            {iconName && <Icon name={iconName} size="md" />}
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationWrapper>
        );
      })}
    </NotificationsWrapper>
  );
};

const NotificationsWrapper = styled.div`
  z-index: 999999;
  position: fixed;
  top: ${(p) => p.theme.spacer.md}rem;
  right: ${(p) => p.theme.spacer.md}rem;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
`;

const NotificationWrapper = styled.div<{ type: NotificationType }>`
  display: flex;
  align-items: center;
  padding: ${(p) => p.theme.spacer.md}rem;
  margin: ${(p) => p.theme.spacer.xs}rem;
  border-radius: 0.5rem;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].fg};
  cursor: pointer;
`;

const NotificationMessage = styled.span`
  margin-left: ${(p) => p.theme.spacer.sm}rem;
`;
