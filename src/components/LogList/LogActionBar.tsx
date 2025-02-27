import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import { NotificationType, useNotifications, Notification } from '../Notifications';
import copy from 'copy-to-clipboard';
import Icon from '../Icon';
import { LocalSearchType, LogItem } from '../../hooks/useLogData';
import FilterInput from '../FilterInput';
import { TFunction } from 'i18next';

//
// Typedef
//

type LogActionBarProps = {
  setFullscreen?: () => void;
  downloadlink: string;
  data: LogItem[];
  search: LocalSearchType;
  spaceAround?: boolean;
};

const handleFilterChange = (search: LocalSearchType) => (key: string) => {
  search.search(key);
};

const handleFilterSubmit = (search: LocalSearchType) => () => {
  search.nextResult();
};

const handleCopyButtonClick =
  (
    addNotification: (...notification: Notification[]) => void,
    data: LogItem[],
    t: TFunction<'translation', undefined, 'translation'>,
  ) =>
  () => {
    copy(data.map((item) => (typeof item === 'object' ? item.line : item)).join('\n'));
    addNotification({
      type: NotificationType.Info,
      message: t('task.all-logs-copied'),
    });
  };

//
// Component
//

const LogActionBar: React.FC<LogActionBarProps> = ({
  setFullscreen,
  downloadlink,
  data,
  search,
  spaceAround = false,
}) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  return (
    <LogActionBarContainer spaceAround={spaceAround} data-testid="log-action-bar">
      <>
        <SearchContainer>
          <FilterInput
            sectionLabel={t('task.log-search')}
            onChange={handleFilterChange(search)}
            onSubmit={handleFilterSubmit(search)}
            noClear
            customIcon={['search', 'sm']}
            customIconElement={
              search.result.active &&
              search.result.result.length > 0 && (
                <ResultElement>
                  {search.result.current + 1}/{search.result.result.length}
                </ResultElement>
              )
            }
            infoMsg={t('task.log-search-tip') ?? ''}
          />
        </SearchContainer>
        <Buttons data-testid="log-action-bar-buttons">
          {data && data.length > 0 && (
            <Button
              data-testid="log-action-button"
              title={t('task.copy-logs-to-clipboard') ?? ''}
              iconOnly
              onClick={handleCopyButtonClick(addNotification, data, t)}
            >
              <Icon name="copy" size="sm" />
            </Button>
          )}

          <a title={t('task.download-logs') ?? ''} href={downloadlink} download data-testid="log-action-button">
            <Button
              onClick={() => {
                addNotification({
                  type: NotificationType.Info,
                  message: t('task.downloading-logs'),
                });
              }}
              iconOnly
            >
              <Icon name="download" size="sm" />
            </Button>
          </a>

          {setFullscreen && (
            <Button
              title={t('task.show-fullscreen') ?? ''}
              onClick={() => setFullscreen()}
              withIcon
              data-testid="log-action-button"
            >
              <Icon name="maximize" size="sm" />
            </Button>
          )}
        </Buttons>
      </>
    </LogActionBarContainer>
  );
};

const SearchContainer = styled.div`
  widht: 19rem;
`;

const LogActionBarContainer = styled.div<{ spaceAround: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: ${(p) => (p.spaceAround ? '0 1rem' : '0')};
`;

const Buttons = styled.div`
  display: flex;
  flex: 0;

  button {
    width: 2.5rem;
    height: 2.5rem;
    margin-left: 0.5rem;

    i {
      margin: 0 auto;
    }
  }
`;

const ResultElement = styled.div`
  font-size: var(--font-size-primary);
  line-height: 1.25rem;
`;

export default LogActionBar;
