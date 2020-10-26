import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SmallText } from '../Text';

import ResourceEvents from '../../ws';

const WS_QUEUE_TTL_SECONDS = 60 * 5; // 5 minute TTL (backend default value)

type RealtimeStatus = 'Connected' | 'Stale' | 'Disconnected';

const nowUnixTime = () => Math.floor(new Date().getTime() / 1000);

const ConnectionStatus: React.FC = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<RealtimeStatus>('Connected');
  const [connectedSinceUnixTime, setConnectedSinceUnixTime] = useState<number | null>(null);

  useEffect(() => {
    const onOpen = () => {
      const now = nowUnixTime();

      if (connectedSinceUnixTime && now - connectedSinceUnixTime > WS_QUEUE_TTL_SECONDS) {
        // Mark connection state as `Stale` if disconnection period exceeds queue TTL
        // This means we can't deliver missing data to the client reliably and user should refresh the browser
        // `setConnectedSinceUnixTime` will be preserved so that stale status is persisted
        setStatus('Stale');
      } else {
        // Disconnection period was lass than queue TTL, set status to `Connected` and clear `setConnectedSinceUnixTime`
        setStatus('Connected');
        setConnectedSinceUnixTime(null);
      }
    };

    const onClose = () => {
      if (!connectedSinceUnixTime) {
        setConnectedSinceUnixTime(nowUnixTime());
      }
      setStatus('Disconnected');
    };

    ResourceEvents.addEventListener('open', onOpen);
    ResourceEvents.addEventListener('close', onClose);
    return () => {
      ResourceEvents.removeEventListener('open', onOpen);
      ResourceEvents.removeEventListener('close', onClose);
    };
  }, [status, connectedSinceUnixTime]);

  return (
    <Wrapper
      status={status}
      onClick={() => {
        if (status === 'Stale') {
          // Refresh the page only if status is `Stale`
          window.location.reload();
        }
      }}
    >
      <Text status={status}>
        {status === 'Stale' ? t('connection.data-might-be-stale') : t('connection.waiting-for-connection')}
      </Text>
      <StatusColorIndicator status={status} />
    </Wrapper>
  );
};

export default ConnectionStatus;

const Wrapper = styled.div<{ status: RealtimeStatus }>`
  display: flex;
  align-items: center;
  pointer-events: ${(p) => (p.status === 'Stale' ? 'auto' : 'none')};
  cursor: pointer;
`;

const Text = styled(SmallText)<{ status: RealtimeStatus }>`
  white-space: 'nowrap';
  transition: opacity 0.6s;
  opacity: ${(p) => (p.status === 'Connected' ? 0 : 1)};
`;

const StatusColorIndicator = styled.div<{ status: RealtimeStatus }>`
  height: 8px;
  width: 8px;
  border-radius: 2px;
  transition: background-color 0.15s;

  background-color: ${(p) => {
    switch (p.status) {
      case 'Connected':
        return p.theme.color.bg.green;
      case 'Stale':
        return p.theme.color.bg.yellow;
      case 'Disconnected':
        return p.theme.color.bg.red;
      default:
        return p.theme.color.bg.green;
    }
  }};

  margin-left: ${(p) => p.theme.spacer.sm}rem;
`;
