import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import { apiHttp } from '@/constants';
import { AsyncStatus, Announcement as IAnnouncement, AnnouncementHeader as IAnnouncementHeader } from '@/types';
import { MessageRender } from '@components/Announcement';
import ContentHeader from '@components/Content/ContentHeader';
import ContentWrapper from '@components/Content/ContentWrapper';
import ErrorBoundary from '@components/GeneralErrorBoundary';
import GenericError from '@components/GenericError';
import Icon from '@components/Icon';
import Spinner from '@components/Spinner';
import { ItemRow } from '@components/Structure';
import { logWarning } from '@utils/errorlogger';
import LaunchIconBlack from '@assets/launch_black.svg';

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AsyncStatus>('Loading');
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [combinedArray, setCombinedArray] = useState<(IAnnouncement | IAnnouncementHeader)[]>([]);

  useEffect(() => {
    setStatus('Loading');
    fetch(apiHttp(`/notifications`), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            if (Array.isArray(data)) {
              data.sort((a, b) => (b.start || b.created) - (a.start || a.created));
              setAnnouncements(data);
              setStatus('Ok');
            } else {
              logWarning('Failed to fetch announcements.');
            }
          });
        }
      })
      .catch((e) => {
        logWarning('Failed to fetch announcements.', e);
        setStatus('Error');
      });
  }, []);

  useEffect(() => {
    const parseHeader = (time: number | undefined) => {
      if (time === undefined) {
        return t('notifications.unsorted');
      }

      const dateString = spacetime(time).format('{day}, {date-pad}.{month-iso}.{year}');
      return dateString as string;
    };

    announcements.forEach((result, index, array) => {
      // check when the dates day changes
      if (
        spacetime(result.created as number).date() !== spacetime(array[index - 1]?.created as number).date() ||
        index === 0
      ) {
        // push a header into the array
        setCombinedArray((combinedArray) => [
          ...combinedArray,
          {
            id: (new Date().getTime() + index).toString(),
            message: parseHeader((result.start !== null && result.start) || result.created),
            type: 'header',
          },
        ]);
      }
      return setCombinedArray((combinedArray) => [...combinedArray, result]);
    });
  }, [announcements, t]);

  const parsePublished = (time: number | undefined) => {
    if (time === undefined) {
      return t('notifications.dateMissing');
    }

    const dateString = spacetime(time).format('{date-pad}.{month-iso}.{year}, {hour-24-pad}.{minute-pad} GMT{offset}');
    return dateString;
  };

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <ErrorBoundary message={'notifications error'}>
        <Content>
          <Header>{t('notifications.header')}</Header>
          {status === 'Loading' && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <Spinner md />
            </div>
          )}

          {status === 'Ok' && combinedArray.length === 0 && (
            <ItemRow margin="md">
              <GenericError icon="searchNotFound" message={t('error.no-results')} />
            </ItemRow>
          )}

          {status === 'Ok' && (
            <div data-testid={'notification-results'}>
              {combinedArray.map((announcement) => {
                if (announcement.type === 'header') {
                  return <ContentHeader key={announcement.id}>{announcement.message}</ContentHeader>;
                } else {
                  return (
                    <ContentWrapper data-testid={'notification-result'} key={announcement.id}>
                      <IconWrapper>
                        <Icon name="warningThick" size="md" />
                      </IconWrapper>
                      <MessageWrapper>
                        <MessageRender item={announcement as IAnnouncement} />
                        <Published>{`${t('notifications.published')} ${parsePublished(
                          ((announcement as IAnnouncement).start !== null && (announcement as IAnnouncement).start) ||
                            (announcement as IAnnouncement).created,
                        )}`}</Published>
                      </MessageWrapper>
                    </ContentWrapper>
                  );
                }
              })}
            </div>
          )}
        </Content>
      </ErrorBoundary>
    </div>
  );
};

export default Notifications;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 100%;
  position: relative;
`;

const Header = styled.h3`
  margin: 1rem 0;
`;

const IconWrapper = styled.div`
  color: #000;
  padding: 0.25rem;
`;

const MessageWrapper = styled.div`
  flex-direction: column;
  margin: 0 0 0 1rem;

  .markdown {
    font-size: 1rem;
    font-weight: 500;
    line-height: 2rem;
  }
  .markdown a {
    color: inherit;

    &::after {
      content: url(${LaunchIconBlack});
      display: inline-block;
      margin: 0 0 0 0.25rem;
      position: relative;
      top: 0.25rem;
    }
  }
`;

const Published = styled.span`
  color: #666;
  display: block;
  font-size: 0.625rem;
  line-height: 1rem;
`;
