import React from 'react';
import { useTranslation } from 'react-i18next';
import { Log } from '../../types';
import Button from '../Button';
import { NotificationType, useNotifications } from '../Notifications';
import { ItemRow } from '../Structure';
import copy from 'copy-to-clipboard';
import Icon from '../Icon';
import { downloadString } from '../../utils/file';

//
// Typedef
//

type LogActionBarProps = {
  setFullscreen?: () => void;
  name: string;
  data: Log[];
};

//
// Component
//

const LogActionBar: React.FC<LogActionBarProps> = ({ setFullscreen, name, data }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  return (
    <ItemRow>
      {data && data.length > 0 && (
        <Button
          title={t('task.copy-logs-to-clipboard')}
          iconOnly
          onClick={() => {
            copy(data.map((item) => item.line).join('\n'));
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
        <Button
          title={t('task.download-logs')}
          iconOnly
          onClick={() => {
            downloadString(data.map((log) => log.line).join('\n'), 'text/plain', `logs-${name}.txt`);
          }}
        >
          <Icon name="download" />
        </Button>
      )}

      {data && data.length > 0 && setFullscreen && (
        <Button title={t('task.show-fullscreen')} onClick={() => setFullscreen()} withIcon>
          <Icon name="maximize" />
        </Button>
      )}
    </ItemRow>
  );
};

export default LogActionBar;
