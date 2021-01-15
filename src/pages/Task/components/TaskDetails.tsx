import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InformationRow from '../../../components/InformationRow';
import ParameterTable from '../../../components/ParameterTable';
import PropertyTable from '../../../components/PropertyTable';
import ShowDetailsButton from '../../../components/ShowDetailsButton';
import StatusField from '../../../components/Status';
import { ForceBreakText } from '../../../components/Text';
import { Metadata, Task as ITask } from '../../../types';
import { getISOString } from '../../../utils/date';
import { formatDuration } from '../../../utils/format';
import { Resource } from '../../../hooks/useResource';
import GenericError from '../../../components/GenericError';
import Spinner from '../../../components/Spinner';
import { ItemRow } from '../../../components/Structure';
import { TimezoneContext } from '../../../components/TimezoneProvider';

type Props = {
  task: ITask;
  attempts: ITask[];
  metadata: Resource<Metadata[]>;
};

const TaskDetails: React.FC<Props> = ({ task, attempts, metadata }) => {
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
              accessor: (item) => (
                <ForceBreakText>{item.foreach_label || item.task_name || item.task_id}</ForceBreakText>
              ),
            },
            { label: t('items.step'), prop: 'step_name' },
            {
              label: t('fields.status'),
              accessor: (_item) => <StatusField status={_item.status} />,
            },
            {
              label: t('fields.started-at'),
              accessor: (item) =>
                item.ts_epoch ? getISOString(new Date(getAttemptStartTime(attempts, item)), timezone) : '',
            },
            {
              label: t('fields.finished-at'),
              accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at), timezone) : ''),
            },
            {
              label: t('fields.duration'),
              accessor: (item) => getAttemptDuration(attempts, item),
            },
          ]}
        />
      </InformationRow>

      {expanded && (
        <InformationRow data-testid="task-metadata">
          {metadata.status === 'NotAsked' && (
            <ItemRow justify="center" data-testid="task-metadata-notasked">
              {t('task.metadata-not-loaded')}
            </ItemRow>
          )}
          {metadata.status === 'Loading' && (
            <ItemRow justify="center" data-testid="task-metadata-loading">
              <Spinner />
            </ItemRow>
          )}
          {metadata.status === 'Error' && (
            <GenericError message={t('task.failed-to-load-metadata')} data-testid="task-metadata-error" />
          )}
          {metadata.status === 'Ok' && (
            <ParameterTable items={metadataParams} label={t('task.metadata')} data-testid="task-metadata-ok" />
          )}
        </InformationRow>
      )}

      <ShowDetailsButton
        toggle={() => setExpanded(!expanded)}
        visible={expanded}
        showText={t('task.show-task-metadata')}
        hideText={t('task.hide-task-metadata')}
        data-testid="task-expand-button"
      />
    </>
  );
};

//
// Figure out the duration of current attempt of current task. There might be many attempts
// and on those cases we need to calculate duration from previous attempt IF attempt doesn't
// have started at value which indicates that actual duration value of attempt is correct.
//
export function getAttemptDuration(tasks: ITask[], task: ITask): string {
  // If task has started at, it must have proper duration as well. Else calculate
  if (!task.started_at && tasks && tasks.length > 1) {
    const attemptBefore = tasks[tasks.indexOf(task) - 1];

    if (attemptBefore && attemptBefore.duration && task.duration) {
      return formatDuration(task.duration - attemptBefore.duration);
    }
  }
  return task.duration ? formatDuration(task.duration) : '';
}

export function getAttemptStartTime(allAttempts: ITask[] | null, task: ITask): number {
  const taskTimeStamp = task.started_at || task.ts_epoch;

  if (!allAttempts) return taskTimeStamp;

  const first = allAttempts.find((t) => t.attempt_id === 0);

  if (task.attempt_id === 0 || (first && first.ts_epoch !== taskTimeStamp)) {
    return taskTimeStamp;
  } else {
    const previous = allAttempts.find((t) => t.attempt_id === task.attempt_id - 1);
    return previous?.finished_at || taskTimeStamp;
  }
}

export default TaskDetails;
