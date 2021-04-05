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
      id: '0923489rh9a38g98g9',
      type: NotificationType.Default,
      message: 'ATTENTION! Service will be unavailable 4.24.2021 at 6:00 AM (Mountain time) for updates.',
    },
    {
      id: '1211',
      type: NotificationType.Info,
      message: 'Metaflow online conference will happen at 5.30.2021. Check Metaflow twitter for more info',
    },
  ];

  return (
    <AnnouncementsContainer>
      {announcements
        .filter((item) => seen.indexOf(item.id) === -1)
        .map((item) => (
          <AnnouncementItem key={item.id} item={item} />
        ))}
    </AnnouncementsContainer>
  );
};

const AnnouncementItem: React.FC<{ item: Announcement }> = ({ item }) => {
  const [open, setOpen] = useState(true);

  return (
    <HeightAnimatedContainer>
      <AnnouncementItemContainer type={item.type} open={open}>
        {item.message}
        <AnnouncementClose
          onClick={() => {
            setOpen(false);
            addToSeenList(item.id);
          }}
        >
          <Icon name="times" />
        </AnnouncementClose>
      </AnnouncementItemContainer>
    </HeightAnimatedContainer>
  );
};

const AnnouncementsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const AnnouncementItemContainer = styled.div<{ type: NotificationType; open: boolean }>`
  position: ${(p) => (p.open ? 'relative' : 'absolute')};
  padding: 0.5rem 10rem;
  text-align: center;
  width: 100%;
  background: ${({ theme, type }) => theme.notification[type].bg};
  color: ${({ theme, type }) => theme.notification[type].fg};
`;

const AnnouncementClose = styled.div`
  position: absolute;
  right: 1rem;
  top: 0;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
`;

export default Announcements;
