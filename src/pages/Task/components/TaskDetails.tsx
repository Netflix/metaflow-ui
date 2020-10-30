import React from 'react';
import { useTranslation } from 'react-i18next';
import InformationRow from '../../../components/InformationRow';
import PropertyTable from '../../../components/PropertyTable';
import StatusField from '../../../components/Status';
import { ForceBreakText } from '../../../components/Text';
import { Task as ITask } from '../../../types';
import { getISOString } from '../../../utils/date';
import { formatDuration } from '../../../utils/format';

type Props = {
  task: ITask;
  attempts: ITask[];
};

const TaskDetails: React.FC<Props> = ({ task, attempts }) => {
  const { t } = useTranslation();

  return (
    <InformationRow spaceless>
      <PropertyTable
        items={[task]}
        columns={[
          {
            label: t('fields.task-id') + ':',
            accessor: (item) => <ForceBreakText>{item.task_id}</ForceBreakText>,
          },
          { label: t('items.step') + ':', prop: 'step_name' },
          {
            label: t('fields.status') + ':',
            accessor: (_item) => <StatusField status={_item.status} />,
          },
          {
            label: t('fields.started-at') + ':',
            accessor: (item) => (item.ts_epoch ? getISOString(new Date(getAttemptStartTime(attempts, item))) : ''),
          },
          {
            label: t('fields.finished-at') + ':',
            accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at)) : ''),
          },
          {
            label: t('fields.duration') + ':',
            accessor: (item) => getDuration(attempts, item),
          },
        ]}
      />
    </InformationRow>
  );
};

//
// Figure out the duration of current attempt of current task. There might be many attempts
// and on those cases we need to calculate duration from previous attempt
//
function getDuration(tasks: ITask[], task: ITask) {
  if (tasks && tasks.length > 1) {
    const attemptBefore = tasks[tasks.indexOf(task) - 1];

    if (attemptBefore && attemptBefore.duration && task.duration) {
      return formatDuration(task.duration - attemptBefore.duration);
    }
  }
  return task.duration ? formatDuration(task.duration) : '';
}

function getAttemptStartTime(allAttempts: ITask[] | null, task: ITask) {
  const taskTimeStamp = task.started_at || task.ts_epoch;

  if (!allAttempts) return taskTimeStamp;

  const index = allAttempts.indexOf(task);
  if (index === 0 || taskTimeStamp !== (allAttempts[0].started_at || allAttempts[0].ts_epoch)) {
    return taskTimeStamp;
  } else {
    const previous = allAttempts[index - 1];
    return previous?.finished_at || taskTimeStamp;
  }
}

export default TaskDetails;
