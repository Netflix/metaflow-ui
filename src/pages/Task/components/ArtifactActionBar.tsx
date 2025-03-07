import copy from 'copy-to-clipboard';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@components/Button';
import Icon from '@components/Icon';
import { NotificationType, useNotifications } from '@components/Notifications';
import { ItemRow } from '@components/Structure';
import { downloadString } from '@utils/file';

//
// Typedef
//

type ArtifactActionBarProps = {
  name: string;
  data: string;
};

//
// Component
//

const ArtifactActionBar: React.FC<ArtifactActionBarProps> = ({ name, data }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  return (
    <ItemRow>
      <Button
        title={t('task.copy-to-clipboard') ?? ''}
        iconOnly
        onClick={() => {
          copy(data);
          addNotification({
            type: NotificationType.Info,
            message: t('task.artifact-copied'),
          });
        }}
      >
        <Icon name="copy" />
      </Button>

      <Button
        title={t('task.download-artifact-content') ?? ''}
        iconOnly
        onClick={() => {
          downloadString(data, 'text/plain', `artifact-${name}.txt`);
        }}
      >
        <Icon name="download" />
      </Button>
    </ItemRow>
  );
};

export default ArtifactActionBar;
