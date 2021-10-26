import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import { NotificationType, useNotifications } from '../Notifications';
import { ItemRow } from '../Structure';
import copy from 'copy-to-clipboard';
import Icon from '../Icon';
// import { downloadString } from '../../utils/file';
import { LogItem } from '../../hooks/useLogData';

//
// Typedef
//

type LogActionBarProps = {
  setFullscreen?: () => void;
  downloadlink: string;
  data: LogItem[];
};

//
// Component
//

const LogActionBar: React.FC<LogActionBarProps> = ({ setFullscreen, downloadlink, data }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  return (
    <ItemRow data-testid="log-action-bar">
      {data && data.length > 0 && (
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
      )}

      {data && data.length > 0 && (
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
      )}

      {data && data.length > 0 && setFullscreen && (
        <Button
          title={t('task.show-fullscreen')}
          onClick={() => setFullscreen()}
          withIcon
          data-testid="log-action-button"
        >
          <Icon name="maximize" />
        </Button>
      )}
    </ItemRow>
  );
};

export default LogActionBar;
