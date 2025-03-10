import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ResourceEvents from '@/ws';
import { SmallText } from '@components/Text';

const WS_QUEUE_TTL_SECONDS = 60 * 5; // 5 minute TTL (backend default value)

type RealtimeStatus = 'Connected' | 'Stale' | 'Disconnected';

const nowUnixTime = () => Math.floor(new Date().getTime() / 1000);

//
// Component for showing websocket status on top of the page.
//

const ConnectionStatus: React.FC = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<RealtimeStatus>('Connected');
  const [lastPong, setLastPong] = useState<null | number>(null);

  useEffect(() => {
    const onOpen = () => {
      const now = nowUnixTime();

      if (lastPong && now - lastPong > WS_QUEUE_TTL_SECONDS) {
        // Mark connection state as `Stale` if disconnection period exceeds queue TTL
        // This means we can't deliver missing data to the client reliably and user should refresh the browser
        // `setConnectedSinceUnixTime` will be preserved so that stale status is persisted
        setStatus('Stale');
      } else if (status !== 'Stale') {
        // Disconnection period was lass than queue TTL, set status to `Connected` and clear `setConnectedSinceUnixTime`
        setStatus('Connected');
      }
    };

    const onClose = () => {
      setStatus('Disconnected');
    };

    const onMessage = (e: MessageEvent) => {
      if (e && e.data === '__pong__') {
        setLastPong(nowUnixTime());
      }
    };

    ResourceEvents.addEventListener('open', onOpen);
    ResourceEvents.addEventListener('message', onMessage);
    ResourceEvents.addEventListener('close', onClose);
    return () => {
      ResourceEvents.removeEventListener('open', onOpen);
      ResourceEvents.addEventListener('message', onMessage);
      ResourceEvents.removeEventListener('close', onClose);
    };
  }, [status, lastPong]);

  return (
    <Wrapper
      data-testid="connection-status-wrapper"
      status={status}
      onClick={() => {
        if (status === 'Stale') {
          // Refresh the page only if status is `Stale`
          window.location.reload();
        }
      }}
    >
      <Text status={status} data-testid={status}>
        {status === 'Stale'
          ? t('connection.data-might-be-stale')
          : status === 'Connected'
            ? t('connection.connected')
            : t('connection.waiting-for-connection')}
      </Text>
      <StatusColorIndicator status={status} />
    </Wrapper>
  );
};

export default ConnectionStatus;

//
// Style
//

const Text = styled(SmallText)<{ status: RealtimeStatus }>`
  white-space: 'nowrap';
  transition: opacity 0.25s;
  opacity: ${(p) => (p.status === 'Connected' ? 0 : 1)};
  position: absolute;
  right: 0;
  top: 100%;
  color: var(--color-text-alternative);
  background: var(--tooltip-bg);
  border-radius: var(--radius-primary);
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
`;

const Wrapper = styled.div<{ status: RealtimeStatus }>`
  display: flex;
  align-items: center;
  cursor: ${(p) => (p.status === 'Stale' ? 'pointer' : 'normal')};

  &:hover ${Text} {
    opacity: 1;
  }
  height: 2rem;
  width: 2rem;
  position: relative;
`;

const StatusColorIndicator = styled.div<{ status: RealtimeStatus }>`
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 50%;
  transition: background-color 0.15s;
  outline-style: solid;
  outline-width: 6px;

  background-color: ${(p) => {
    switch (p.status) {
      case 'Connected':
        return 'var(--color-success)';
      case 'Stale':
        return 'var(--color-warning)';
      case 'Disconnected':
        return 'var(--color-danger)';
      default:
        return 'var(--color-success)';
    }
  }};

  outline-color: ${(p) => {
    switch (p.status) {
      case 'Connected':
        return 'var(--color-success-light)';
      case 'Stale':
        return 'transparent';
      case 'Disconnected':
        return 'transparent';
      default:
        return 'var(--color-success-light)';
    }
  }};

  margin-left: var(--spacing-3);
`;
