import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from '@components/Button';
import { ItemRow } from '@components/Structure';
import useLogger from '@hooks/useLogger';
import { getLogs } from '@utils/debugdb';

//
// Debug information logger. Logging records all HTTP and WS info to text file.
//

const Logger: React.FC = () => {
  const { enabled, stopLogging } = useLogger();
  const { t } = useTranslation();

  return enabled ? (
    <LoggerContainer data-testid="logger_container">
      <ItemRow justify="space-between">
        <div style={{ width: '100%' }}>{t('debug.recording_logs')}</div>

        <ItemRow>
          <Button
            textOnly
            onClick={() => {
              getLogs();
              stopLogging();
            }}
          >
            {t('debug.stop_and_download')}
          </Button>
          <Button textOnly onClick={stopLogging}>
            {t('debug.stop_and_discard')}
          </Button>
        </ItemRow>
      </ItemRow>
    </LoggerContainer>
  ) : null;
};

//
// Style
//

const LoggerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 35rem;
  z-index: 999;
  background: #dd5d54;
  color: #fff;

  padding: 0.15rem 0 0.15rem 0.5rem;

  button {
    white-space: nowrap;
    color: #fff;
    background: rgba(0, 0, 0, 0.2);

    &:hover {
      background: transparent;
      background: rgba(0, 0, 0, 0.1);
    }

    &:last-child {
      margin-right: 0.5rem;
    }
  }
`;

export default Logger;
