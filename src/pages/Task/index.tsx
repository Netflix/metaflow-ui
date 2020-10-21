import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';
import { useTranslation } from 'react-i18next';
import { Run as IRun, Task as ITask, Artifact, Log } from '../../types';
import useResource from '../../hooks/useResource';
import { formatDuration } from '../../utils/format';
import { getISOString } from '../../utils/date';
import StatusField from '../../components/Status';

import Plugins, { Plugin, PluginTaskSection } from '../../plugins';
import { RowDataAction, RowDataModel } from '../../components/Timeline/useRowData';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import { ForceBreakText } from '../../components/Text';
import LogList from '../../components/LogList';
import FullPageContainer from '../../components/FullPageContainer';
import useSeachField from '../../hooks/useSearchField';
import Spinner from '../../components/Spinner';
import GenericError, { DefaultAdditionalErrorInfo } from '../../components/GenericError';
import { TabsHeading, TabsHeadingItem } from '../../components/Tabs';
import SectionLoader from './components/SectionLoader';

//
// View container
//

type TaskViewContainer = {
  run: IRun;
  stepName?: string;
  taskId?: string;
  rowData: RowDataModel;
  rowDataDispatch: (action: RowDataAction) => void;
  groupBy: { value: boolean; set: (val: boolean) => void };
};

const TaskViewContainer: React.FC<TaskViewContainer> = ({
  run,
  stepName,
  taskId,
  rowData,
  rowDataDispatch,
  groupBy,
}) => {
  const { t } = useTranslation();
  if (!stepName || !taskId) {
    return <>{t('run.no-run-data')}</>;
  }

  return (
    <Task
      run={run}
      stepName={stepName}
      taskId={taskId}
      rowData={rowData}
      rowDataDispatch={rowDataDispatch}
      groupBy={groupBy}
    />
  );
};

//
// Task view
//

type TaskViewProps = {
  run: IRun;
  stepName: string;
  taskId: string;
  rowData: RowDataModel;
  rowDataDispatch: (action: RowDataAction) => void;
  groupBy: { value: boolean; set: (val: boolean) => void };
};

const sortTaskAttempts = (a: ITask, b: ITask) => a.attempt_id - b.attempt_id;

const Task: React.FC<TaskViewProps> = ({ run, stepName, taskId, rowData, rowDataDispatch, groupBy }) => {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<null | 'stdout' | 'stderr'>(null);
  const [task, setTask] = useState<ITask | null>(null);
  const attemptId = task ? task.attempt_id : null;
  const isCurrentTaskFinished = task && (task.finished_at || task.status === 'failed');

  const { data: tasks, status, error } = useResource<ITask[], ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/attempts`,
    subscribeToEvents: true,
    initialData: null,
    pause: stepName === 'not-selected' || taskId === 'not-selected',
  });

  const { data: artifacts, status: artifactStatus, error: artifactError } = useResource<Artifact[], Artifact>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/artifacts`,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId.toString() : '',
    },
    subscribeToEvents: true,
    initialData: [],
    pause: !isCurrentTaskFinished,
  });

  // Task data will be array so we need to set one of them as active task when they arrive
  useEffect(() => {
    if (status === 'Ok' && task === null && tasks && tasks.length > 0) {
      setTask(tasks.sort(sortTaskAttempts)[tasks.length - 1]);
    }
  }, [tasks, status, task]);

  //
  // Plugins helpers begin
  //
  const sectionPlugins = useMemo(() => Plugins.all().filter((plugin) => plugin['task-view']?.sections), []);

  const pluginComponentsForSection = useMemo(
    () => (sectionKey: string) =>
      sectionPlugins.reduce((components: PluginTaskSection[], plugin: Plugin) => {
        const sectionMatches = (plugin['task-view']?.sections || []).filter((section) => section.key === sectionKey);
        return [...components, ...sectionMatches];
      }, []),
    [sectionPlugins],
  );
  const renderComponentsForSection = useMemo(
    () => (sectionKey: string) =>
      pluginComponentsForSection(sectionKey).map(({ component: Component }, index) => {
        return Component ? <Component key={index} task={task} artifacts={artifacts} /> : null;
      }),
    [task, artifacts, pluginComponentsForSection],
  );
  const pluginSectionsCustom = useMemo(
    () =>
      sectionPlugins
        .reduce((sections: string[], plugin: Plugin) => {
          const sectionKeys = (plugin['task-view']?.sections || []).map((section) => section.key);
          return [...sections, ...sectionKeys];
        }, []) // Find section keys from plugins
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .filter((key) => !['taskinfo', 'stdout', 'stderr', 'artifacts'].includes(key)), // Ignore built-in sections
    [sectionPlugins],
  );

  //
  // Plugins helpers end
  // Logs start
  //

  const [stdout, setStdout] = useState<Log[]>([]);
  const { status: statusOut, error: logStdError } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out`,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId.toString() : '',
    },
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: !isCurrentTaskFinished,
    onUpdate: (items) => {
      items && setStdout((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  const [stderr, setStderr] = useState<Log[]>([]);
  const { status: statusErr, error: logErrError } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err`,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId.toString() : '',
    },
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: !isCurrentTaskFinished,
    onUpdate: (items) => {
      items && setStderr((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  useEffect(() => {
    setStdout([]);
    setStderr([]);
    setTask(null);
  }, [stepName, taskId]);

  const selectTask = (task: ITask) => {
    setTask(task);
  };

  //
  // Search features
  //
  const { results, fieldProps } = useSeachField(run.flow_id, run.run_number);

  return (
    <TaskContainer>
      <TaskList
        rowData={rowData}
        rowDataDispatch={rowDataDispatch}
        activeTaskId={taskId}
        results={results}
        searchFieldProps={fieldProps}
        groupBy={groupBy}
      />

      {status === 'Loading' && (
        <TaskLoaderContainer>
          <Spinner md />
        </TaskLoaderContainer>
      )}

      {error && status !== 'Loading' && <GenericError icon="listItemNotFound" message={t('error.load-error')} />}

      {status === 'Ok' && tasks && tasks.length === 0 && (
        <GenericError icon="listItemNotFound" message={t('error.not-found')} />
      )}

      {taskId === 'not-selected' && status !== 'Loading' && (
        <GenericError icon="listItemNotFound" message={t('task.no-task-selected')} />
      )}

      {fullscreen === null && status === 'Ok' && task && (
        <AnchoredView
          header={
            status === 'Ok' && tasks && tasks.length > 0 ? (
              <TabsHeading>
                {tasks.sort(sortTaskAttempts).map((item, index) => (
                  <TabsHeadingItem key={index} onClick={() => selectTask(item)} active={item === task}>
                    {t('task.attempt')} {index + 1}
                  </TabsHeadingItem>
                ))}
              </TabsHeading>
            ) : undefined
          }
          sections={[
            {
              key: 'taskinfo',
              order: 1,
              noTitle: true,
              label: t('task.task-info'),
              component: (
                <>
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
                          accessor: (item) =>
                            item.ts_epoch ? getISOString(new Date(getAttemptStartTime(tasks, item))) : '',
                        },
                        {
                          label: t('fields.finished-at') + ':',
                          accessor: (item) => (item.finished_at ? getISOString(new Date(item.finished_at)) : ''),
                        },
                        {
                          label: t('fields.duration') + ':',
                          accessor: (item) => (tasks ? getDuration(tasks, item) : ''),
                        },
                      ]}
                    />
                  </InformationRow>
                  {renderComponentsForSection('taskinfo')}
                </>
              ),
            },
            {
              key: 'stdout',
              order: 2,
              label: t('task.std-out'),
              component: (
                <>
                  <SectionLoader
                    status={statusOut}
                    error={logStdError}
                    customNotFound={DefaultAdditionalErrorInfo(t('task.logs-only-available-AWS'))}
                    component={
                      <LogList
                        rows={stdout.length === 0 ? [{ row: 0, line: t('task.no-logs') }] : stdout}
                        onShowFullscreen={() => setFullscreen('stdout')}
                      />
                    }
                  />
                  {renderComponentsForSection('stdout')}
                </>
              ),
            },
            {
              key: 'stderr',
              order: 3,
              label: t('task.std-err'),
              component: (
                <>
                  <SectionLoader
                    status={statusErr}
                    error={logErrError}
                    customNotFound={DefaultAdditionalErrorInfo(t('task.logs-only-available-AWS'))}
                    component={
                      <LogList
                        rows={stderr.length === 0 ? [{ row: 0, line: t('task.no-logs') }] : stderr}
                        onShowFullscreen={() => setFullscreen('stderr')}
                      />
                    }
                  />

                  {renderComponentsForSection('stderr')}
                </>
              ),
            },
            {
              key: 'artifacts',
              order: 4,
              label: t('task.artifacts'),
              component: (
                <>
                  <InformationRow spaceless>
                    <SectionLoader
                      status={artifactStatus}
                      error={artifactError}
                      component={
                        <PropertyTable
                          items={artifacts || []}
                          columns={[
                            { label: t('fields.artifact-name') + ':', prop: 'name' },
                            {
                              label: t('fields.location') + ':',
                              accessor: (item) => <ForceBreakText>{item.location}</ForceBreakText>,
                            },
                            { label: t('fields.datastore-type') + ':', prop: 'ds_type' },
                            { label: t('fields.type') + ':', prop: 'type' },
                            { label: t('fields.content-type') + ':', prop: 'content_type' },
                          ]}
                        />
                      }
                    />
                  </InformationRow>
                  {renderComponentsForSection('artifacts')}
                </>
              ),
            },
            ...pluginSectionsCustom.map((sectionKey, index) => {
              const sections = pluginComponentsForSection(sectionKey).filter((s) => s.component);
              // Get order and label for each section
              // Plugin that is registered first is the priority
              const order = sections.find((s) => s.order)?.order;
              const label = sections.find((s) => s.label)?.label;

              return {
                key: sectionKey,
                order: order || 100 + index,
                label: label || sectionKey,
                component: (
                  <>
                    {sections.map(({ component: Component }, index) => {
                      return Component ? <Component key={index} task={task} artifacts={artifacts} /> : null;
                    })}
                  </>
                ),
              };
            }),
          ].sort((a, b) => a.order - b.order)}
        />
      )}
      {fullscreen && (
        <FullPageContainer
          onClose={() => setFullscreen(null)}
          component={(height) => <LogList rows={fullscreen === 'stdout' ? stdout : stderr} fixedHeight={height} />}
        ></FullPageContainer>
      )}
    </TaskContainer>
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
  if (!allAttempts) return task.ts_epoch;

  const index = allAttempts.indexOf(task);
  if (index === 0 || task.ts_epoch !== allAttempts[0].ts_epoch) {
    return task.ts_epoch;
  } else {
    const previous = allAttempts[index - 1];
    return previous?.finished_at || task.ts_epoch;
  }
}

const TaskContainer = styled.div`
  display: flex;
  padding: 0px 0 25px 0;
  width: 100%;
`;

const TaskLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 2rem;
`;

export default TaskViewContainer;
