import Markdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiHttp } from '@/constants';
import { logWarning } from '@utils/errorlogger';
import LaunchIconWhite from '@assets/launch_white.svg';
import HeightAnimatedContainer from '@components/HeightAnimatedContainer';
import Icon from '@components/Icon';

import { NotificationType } from '@components/Notifications';
import { Announcement as IAnnouncement } from '@/types';

//
// Render list of announcements which are not shown before
//
const Announcements: React.FC = () => {
  const [seen, setSeen] = useState<string[]>(getSeenAnnouncements());
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);

  useEffect(() => {
    const now = Date.now();
    fetch(apiHttp(`/notifications?start:le=${now}&end:ge=${now}`), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            if (Array.isArray(data)) {
              setAnnouncements(data);
            } else {
              logWarning('Failed to fetch announcements.');
            }
          });
        }
      })
      .catch((e) => {
        logWarning('Failed to fetch announcements.', e);
      });
  }, []);

  return (
    <AnnouncementsContainer data-testid="announcements-container">
      {announcements
        .filter((item) => seen.indexOf(item.id) === -1)
        .slice(0, 3)
        .map((item, index) => (
          <AnnouncementItem
            key={item.id}
            item={item}
            last={index === announcements.length - 1}
            onClose={() => setSeen(getSeenAnnouncements())}
          />
        ))}
    </AnnouncementsContainer>
  );
};

//
// Render single announcement
//
const AnnouncementItem: React.FC<{ item: IAnnouncement; last: boolean; onClose: () => void }> = ({
  item,
  last,
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <HeightAnimatedContainer>
      <AnnouncementItemContainer type={item.type} open={open} last={last}>
        <AnnouncementIcon>
          <Icon name="warningThick" size="md" />
        </AnnouncementIcon>
        <AnnouncementText>
          <MessageRender item={item} />
        </AnnouncementText>
        <AnnouncementIcon
          clickable
          onClick={() => {
            setOpen(false);
            addToSeenList(item.id);
            setTimeout(() => {
              onClose();
            }, 250);
          }}
        >
          <Icon name="times" size="md" />
        </AnnouncementIcon>
      </AnnouncementItemContainer>
    </HeightAnimatedContainer>
  );
};

//
// Handle rendering of message in markdown OR plain text
//
export const MessageRender: React.FC<{ item: IAnnouncement }> = ({ item }) => {
  return (
    <>
      {item.contentType === 'markdown' && (
        <Markdown
          className="markdown"
          options={{
            overrides: {
              a: {
                component: MessageUrl,
                props: {
                  target: '_blank',
                },
              },
            },
          }}
        >
          {item.message}
        </Markdown>
      )}
      {item.contentType === 'text' && (
        <Message>
          <>
            {item.message}
            {item.url && (
              <MessageUrl href={item.url} target="_blank">
                {item.urlText || item.url}
              </MessageUrl>
            )}
          </>
        </Message>
      )}
    </>
  );
};

//
// Utils
//

//
// Add item to seen list that is stored in localstorage so we dont show
// those announcements again
//
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

//
// Get all seen announcement IDs from localstorage
//
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

//
// Style
//

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
  background: ${({ type }) => `var(--notification-${type}-bg, --notification-default-bg)`};
  color: ${({ type }) => `var(--notification-${type}-text-color, --notification-default-text-color)`};
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-primary);
  transition: opacity 0.25s;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;

  a {
    color: ${({ type }) => `var(--notification-${type}-text-color, --notification-default-text-color)`};
  }

  img {
    max-width: 100%;
    max-height: 200px;
  }
`;

const AnnouncementIcon = styled.div<{ clickable?: boolean }>`
  align-items: center;
  color: #fff;
  cursor: ${(p) => (p.clickable ? 'pointer' : 'normal')};
  display: flex;
  justify-content: center;
  width: 4rem;
`;

const AnnouncementText = styled.div`
  flex: 1;
`;

const Message = styled.div`
  font-size: 1rem;
  font-weight: 500;
  line-height: 2rem;
`;

const MessageUrl = styled.a`
  color: inherit;
  margin: 0 0 0 0.25rem;

  &::after {
    content: url(${LaunchIconWhite});
    display: inline-block;
    margin: 0 0 0 0.25rem;
    position: relative;
    top: 0.25rem;
  }
`;

export default Announcements;
