import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { SmallText } from '../Text';

import ResourceEvents from '../../ws';

const ConnectionStatus: React.FC = () => {
  const { t } = useTranslation();

  const [connected, setConnected] = useState(true);
  const [showError, setShowError] = useState<boolean>(false);
  const debouncedShowError = useDebouncedCallback((value: boolean) => {
    setShowError(value);
  }, 3000);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
      debouncedShowError.cancel();
      setShowError(false);
    };

    const onClose = () => {
      if (connected) {
        setConnected(false);
        debouncedShowError.callback(true);
      }
    };

    ResourceEvents.addEventListener('open', onOpen);
    ResourceEvents.addEventListener('close', onClose);
    return () => {
      ResourceEvents.removeEventListener('open', onOpen);
      ResourceEvents.removeEventListener('close', onClose);
    };
  }, [connected, showError, debouncedShowError]);

  return (
    <Wrapper>
      <Text visible={showError}>{t('connection.waiting-for-connection')}</Text>
      <StatusColorIndicator connected={connected} />
    </Wrapper>
  );
};

export default ConnectionStatus;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const Text = styled(SmallText)<{ visible: boolean }>`
  white-space: 'nowrap';
  transition: opacity 0.15s;
  opacity: ${(p) => (p.visible ? 1 : 0)};
`;

const StatusColorIndicator = styled.div<{ connected: boolean }>`
  height: 8px;
  width: 8px;
  border-radius: 2px;
  transition: background-color 0.15s;
  background-color: ${(p) => (p.connected ? p.theme.color.bg.green : p.theme.color.bg.red)};
  margin-left: ${(p) => p.theme.spacer.sm}rem;
`;
