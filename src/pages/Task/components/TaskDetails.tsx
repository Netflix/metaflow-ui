import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InformationRow from '../../../components/InformationRow';

import PropertyTable from '../../../components/PropertyTable';
import ShowDetailsButton from '../../../components/ShowDetailsButton';
import StatusField from '../../../components/Status';
import { ForceBreakText } from '../../../components/Text';
import { Metadata, Task as ITask } from '../../../types';
import { getISOString } from '../../../utils/date';
import { formatDuration } from '../../../utils/format';
import { Resource } from '../../../hooks/useResource';
import { APIErrorRenderer } from '../../../components/GenericError';

import { TimezoneContext } from '../../../components/TimezoneProvider';
import { getTaskId } from '../../../utils/task';
import FEATURE_FLAGS from '../../../FEATURE';
import TitledRow from '../../../components/TitledRow';

type Props = {
  task: ITask;
  metadata: Resource<Metadata[]>;
};

const TaskDetails: React.FC<Props> = ({ task, metadata }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { timezone } = useContext(TimezoneContext);

  const metadataParams: Record<string, string> = useMemo(() => {
    return (metadata.data || []).reduce((obj, val) => {
      return { ...obj, [val.field_name]: val.value };
    }, {});
  }, [metadata.data]);

  return (
    <>
      <InformationRow spaceless>
        <PropertyTable
          items={[task]}
          scheme="dark"
          columns={[
            {
              label: t('fields.task-id'),
              accessor: (item) => <ForceBreakText>{getTaskId(item)}</ForceBreakText>,
            },
            { label: t('items.step'), prop: 'step_name' },
            {
              label: t('fields.status'),
              accessor: (_item) => <StatusField status={_item.status} />,
            },
            {
              label: t('fields.started-at'),
              accessor: (item) => (item.started_at ? getISOString(new Date(item.started_at), timezone) : ''),
            },
            {
              label: t('fields.finished-at'),
              accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at), timezone) : ''),
            },
            {
              label: t('fields.duration'),
              accessor: (item) => getAttemptDuration(item),
            },
          ]}
        />
      </InformationRow>

      {expanded && (
        <TitledRow
          title={t('task.metadata')}
          {...(metadata.status !== 'Ok' || Object.keys(metadataParams).length === 0
            ? {
                type: 'default',
                content:
                  metadata.status === 'Error' && metadata.error ? (
                    <APIErrorRenderer error={metadata.error} message={t('run.failed-to-load-metadata')} />
                  ) : (
                    t('run.no-metadata')
                  ),
              }
            : {
                type: 'table',
                content: metadataParams,
              })}
        />
      )}

      {FEATURE_FLAGS.TASK_METADATA && (
        <ShowDetailsButton
          toggle={() => setExpanded(!expanded)}
          visible={expanded}
          showText={t('task.show-task-metadata')}
          hideText={t('task.hide-task-metadata')}
          data-testid="task-expand-button"
        />
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

export default TaskDetails;
