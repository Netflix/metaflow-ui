import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import { NotificationType, useNotifications } from '../Notifications';
import copy from 'copy-to-clipboard';
import Icon from '../Icon';
import { LocalSearchType, LogItem } from '../../hooks/useLogData';

//
// Typedef
//

type LogActionBarProps = {
  setFullscreen?: () => void;
  downloadlink: string;
  data: LogItem[];
  search: LocalSearchType;
};

//
// Component
//

const LogActionBar: React.FC<LogActionBarProps> = ({ setFullscreen, downloadlink, data, search }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  return (
    <LogActionBarContainer data-testid="log-action-bar">
      {data && data.length > 0 && (
        <>
          <LogSearch>
            <LogInputContainer>
              <LogSearchInput
                placeholder="Search"
                onChange={(e) => search.search(e.currentTarget.value)}
                onKeyPress={(e) => {
                  if (search.result.active && e.key === 'Enter') {
                    search.nextResult();
                  }
                }}
              />
              <ResultNumber>
                {search.result.active &&
                  search.result.result.length > 0 &&
                  `${search.result.current + 1}/${search.result.result.length}`}
              </ResultNumber>
            </LogInputContainer>
          </LogSearch>

          <Buttons>
            <Button
              data-testid="log-action-button"
              title={t('task.copy-logs-to-clipboard')}
              iconOnly
              onClick={() => {
                copy(data.map((item) => (typeof item === 'object' ? item.line : item)).join('\n'));
                addNotification({
                  type: NotificationType.Info,
                  message: t('task.all-logs-copied'),
                });
              }}
            >
              <Icon name="copy" />
            </Button>

            <a title={t('task.download-logs')} href={downloadlink} download data-testid="log-action-button">
              <Button
                onClick={() => {
                  addNotification({
                    type: NotificationType.Info,
                    message: t('task.downloading-logs'),
                  });
                }}
                iconOnly
              >
                <Icon name="download" />
              </Button>
            </a>

            {setFullscreen && (
              <Button
                title={t('task.show-fullscreen')}
                onClick={() => setFullscreen()}
                withIcon
                data-testid="log-action-button"
              >
                <Icon name="maximize" />
              </Button>
            )}
          </Buttons>
        </>
      )}
    </LogActionBarContainer>
  );
};

const LogActionBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Buttons = styled.div`
  display: flex;
  flex: 0;
`;

const LogSearch = styled.div`
  padding: 0.25rem 0.5rem;
`;

const LogInputContainer = styled.div`
  background: #e9e9e9;
  border-radius: 4px;
  width: 240px;
  position: relative;
`;

const LogSearchInput = styled.input`
  border: none;
  outline: none;
  line-heigth: 49px;
  height: 28px;
  background: transparent;
  width: 100%;
  padding: 0 0.5rem;
`;

const ResultNumber = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 0;
  line-height: 26px;
`;

export default LogActionBar;
