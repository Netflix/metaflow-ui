import React from 'react';
import styled from 'styled-components';

export enum NotificationType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Default = 'default',
}

export interface NotificationProps {
  type?: NotificationType;
  children: React.ReactNode;
  className?: string;
}

const Notification: React.FC<NotificationProps> = ({ type = NotificationType.Default, children, className = '' }) => {
  return (
    <Wrapper type={type} className={className}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ type: NotificationType }>`
  border-radius: 0.5rem;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].text};
`;

export default Notification;
