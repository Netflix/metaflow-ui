import React from 'react';
import styled from 'styled-components';

export enum NotificationType {
  Success = 'success',
  Primary = 'primary',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

export interface NotificationProps {
  type: NotificationType;
  children: React.ReactNode;
}

const Notification: React.FC<NotificationProps> = ({ type, children }) => {
  return <Wrapper type={type}>{children}</Wrapper>;
};

const Wrapper = styled.div<{ type: NotificationType }>`
  border-radius: 0.5rem;
  background: ${({ theme, type }) => theme.statusColors[type]};
`;

export default Notification;
