import React, { useState } from 'react';
import styled from 'styled-components';
import HeightAnimatedContainer from '../HeightAnimatedContainer';
import Icon from '../Icon';
import { NotificationType } from '../Notifications';

type Announcement = {
  id: string;
  type: NotificationType;
  message: string;
};

/**
 * Add announcement item to seen list. Do we want to do this?
 */
function addToSeenList(id: string) {
  const items = localStorage.getItem('banned-announcements');
  if (items) {
    const parsed: string[] = JSON.parse(items);
    if (Array.isArray(parsed)) {
      if (parsed.indexOf(id) === -1) {
        localStorage.setItem('banned-announcements', JSON.stringify([...parsed, id]));
      }
    } else {
      localStorage.setItem('banned-announcements', JSON.stringify([id]));
    }
  } else {
    localStorage.setItem('banned-announcements', JSON.stringify([id]));
  }
}

function getSeenAnnouncements(): string[] {
  const items = localStorage.getItem('banned-announcements');
  if (items) {
    const parsed: string[] = JSON.parse(items);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  }
  return [];
}

const Announcements: React.FC = () => {
  const seen = getSeenAnnouncements();
  const announcements: Announcement[] = [
    {
      id: '53255',
      type: NotificationType.Default,
      message: 'ATTENTION! Service will be unavailable 4.24.2021 at 6:00 AM (Mountain time) for updates.',
    },
    {
      id: '342',
      type: NotificationType.Info,
      message: 'Upcoming service maintenance 07.04.2021. Starting at 07.00 GMT+03:00. Maintenance details',
    },
    {
      id: '34298798',
      type: NotificationType.Danger,
      message: 'Upcoming service maintenance 07.04.2021. Starting at 07.00 GMT+03:00. Maintenance details',
    },
    {
      id: '3429dsad8798',
      type: NotificationType.Warning,
      message: 'Upcoming service maintenance 07.04.2021. Starting at 07.00 GMT+03:00. Maintenance details',
    },
    {
      id: '3429dsad879118',
      type: NotificationType.Success,
      message: 'Upcoming service maintenance 07.04.2021. Starting at 07.00 GMT+03:00. Maintenance details',
    },
  ];

  return (
    <AnnouncementsContainer>
      {announcements
        .filter((item) => seen.indexOf(item.id) === -1 || true)
        .map((item, index) => (
          <AnnouncementItem key={item.id} item={item} last={index === announcements.length - 1} />
        ))}
    </AnnouncementsContainer>
  );
};

const AnnouncementItem: React.FC<{ item: Announcement; last: boolean }> = ({ item, last }) => {
  const [open, setOpen] = useState(true);

  return (
    <HeightAnimatedContainer>
      <AnnouncementItemContainer type={item.type} open={open} last={last}>
        <AnnouncementIcon>
          <Icon name="info" size="md" />
        </AnnouncementIcon>
        <AnnouncementText>{item.message}</AnnouncementText>
        <AnnouncementIcon
          clickable
          onClick={() => {
            setOpen(false);
            addToSeenList(item.id);
          }}
        >
          <Icon name="times" size="md" />
        </AnnouncementIcon>
      </AnnouncementItemContainer>
    </HeightAnimatedContainer>
  );
};

const AnnouncementsContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rem;
  max-width: 90%;
  margin: 0 auto;
  z-index: 1000;
`;

const AnnouncementItemContainer = styled.div<{ type: NotificationType; open: boolean; last: boolean }>`
  position: ${(p) => (p.open ? 'relative' : 'absolute')};
  opacity: ${(p) => (p.open ? '1' : '0')};
  padding: 1rem 0;
  text-align: left;
  margin: 0rem auto ${(p) => (p.last ? '2.5rem' : '1rem')};
  width: 100%;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].fg};
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 0.25rem;
  transition: opacity 0.25s;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const AnnouncementIcon = styled.div<{ clickable?: boolean }>`
  width: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(p) => (p.clickable ? 'pointer' : 'normal')};
`;

const AnnouncementText = styled.div`
  flex: 1;
`;

export default Announcements;
