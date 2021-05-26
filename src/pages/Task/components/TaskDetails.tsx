import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import StatusField from '../../../components/Status';
import { ForceBreakText } from '../../../components/Text';
import { Metadata, Task as ITask } from '../../../types';
import { getISOString } from '../../../utils/date';
import { formatDuration } from '../../../utils/format';
import { APIErrorRenderer } from '../../../components/GenericError';

import { TimezoneContext } from '../../../components/TimezoneProvider';
import { getTaskId } from '../../../utils/task';
import FEATURE_FLAGS from '../../../utils/FEATURE';
import TitledRow from '../../../components/TitledRow';
import Collapsable from '../../../components/Collapsable';
import Icon from '../../../components/Icon';
import styled from 'styled-components';
import RenderMetadata from '../../../components/RenderMetadata';
import DataHeader from '../../../components/DataHeader';
import { Resource } from '../../../hooks/useResource';

type Props = {
  task: ITask;
  metadata: Metadata[];
  metadataResource: Resource<Metadata[]>;
};

const TaskDetails: React.FC<Props> = ({ task, metadata, metadataResource }) => {
  const { t } = useTranslation();
  const { timezone } = useContext(TimezoneContext);

  const metadataParams: Record<string, string> = (metadata || [])
    .filter((md) => !md.field_name.startsWith('ui-content'))
    .reduce((obj, val) => {
      return { ...obj, [val.field_name]: val.value };
    }, {});

  const uiContent = metadata.filter((md) => md.field_name.startsWith('ui-content')) || [];

  const headerItems = [
    {
      label: t('fields.task-id'),
      value: <ForceBreakText>{getTaskId(task)}</ForceBreakText>,
    },
    { label: t('items.step'), value: task.step_name },
    {
      label: t('fields.status'),
      value: <StatusField status={task.status} />,
    },
    {
      label: t('fields.started-at'),
      value: task.started_at ? getISOString(new Date(task.started_at), timezone) : '',
    },
    {
      label: t('fields.finished-at'),
      value: task.finished_at ? getISOString(new Date(task.finished_at), timezone) : '',
    },
    {
      label: t('fields.duration'),
      value: getAttemptDuration(task),
    },
  ];

  return (
    <>
      <HeaderContainer>
        <DataHeader items={headerItems} />
      </HeaderContainer>

      {FEATURE_FLAGS.TASK_METADATA && (
        <Collapsable title={t('task.task-details')}>
          <TitledRow
            title={t('task.metadata')}
            {...(metadataResource.status !== 'Ok' || Object.keys(metadataParams).length === 0
              ? {
                  type: 'default',
                  content:
                    metadataResource.status === 'Error' && metadataResource.error ? (
                      <APIErrorRenderer error={metadataResource.error} message={t('run.failed-to-load-metadata')} />
                    ) : (
                      t('run.no-metadata')
                    ),
                }
              : {
                  type: 'table',
                  content: metadataParams,
                })}
          />
        </Collapsable>
      )}

      {uiContent.length > 0 && (
        <Collapsable
          title={
            <PluginHeader>
              <Icon name="plugin" />
              {t('task.ui-content')}
            </PluginHeader>
          }
        >
          <RenderMetadata metadata={uiContent} />
        </Collapsable>
      )}
    </>
  );
};

export function getAttemptDuration(task: ITask): string {
  if (task.status === 'running' && task.started_at) {
    return formatDuration(Date.now() - task.started_at);
  }
  return task.duration ? formatDuration(task.duration) : '';
}

const HeaderContainer = styled.div`
  margin-bottom: 1rem;
`;

const PluginHeader = styled.div`
  i {
    margin-right: 0.375rem;
  }

  svg path {
    fill: #333;
  }
`;

export default TaskDetails;
