import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';
import { useTranslation } from 'react-i18next';
import { Run as IRun, Task as ITask, Artifact, Log, AsyncStatus } from '../../types';
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
import GenericError from '../../components/GenericError';
import { TabsHeading, TabsHeadingItem } from '../../components/Tabs';

//
// View container
//

type TaskViewContainer = {
  run: IRun | null;
  stepName?: string;
  taskId?: string;
  rowData: RowDataModel;
  rowDataDispatch: (action: RowDataAction) => void;
};

const TaskViewContainer: React.FC<TaskViewContainer> = ({ run, stepName, taskId, rowData, rowDataDispatch }) => {
  const { t } = useTranslation();
  if (!run?.run_number || !stepName || !taskId) {
    return <>{t('run.no-run-data')}</>;
  }

  return <Task run={run} stepName={stepName} taskId={taskId} rowData={rowData} rowDataDispatch={rowDataDispatch} />;
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
};

const Task: React.FC<TaskViewProps> = ({ run, stepName, taskId, rowData, rowDataDispatch }) => {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<null | 'stdout' | 'stderr'>(null);
  const [task, setTask] = useState<ITask | null>(null);

  const { data: tasks, status, error } = useResource<ITask[], ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks?taskId=${taskId}`,
    subscribeToEvents: true,
    initialData: null,
    pause: stepName === 'not-selected' || taskId === 'not-selected',
  });

  useEffect(() => {
    if (status === 'Ok' && tasks && tasks.length > 0) {
      setTask(tasks[tasks.length - 1]);
    }
  }, [tasks, status]);

  const attemptId = task && tasks ? tasks.indexOf(task) : null;
  const { data: artifacts, status: artifactStatus } = useResource<Artifact[], Artifact>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/artifacts?attempt_id=${attemptId}`,
    subscribeToEvents: true,
    initialData: [],
    pause: stepName === 'not-selected' || taskId === 'not-selected' || attemptId === null,
  });

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
  const { status: statusOut } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out?attempt_id=${attemptId}`,
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: attemptId === null,
    onUpdate: (items) => {
      items && setStdout((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  const [stderr, setStderr] = useState<Log[]>([]);
  const { status: statusErr } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err?attempt_id=${attemptId}`,
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: attemptId === null,
    onUpdate: (items) => {
      items && setStderr((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  useEffect(() => {
    setStdout([]);
    setStderr([]);
    setTask(null);
  }, [taskId]);

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
      />

      {status === 'Loading' && (
        <TaskLoaderContainer>
          <Spinner md />
        </TaskLoaderContainer>
      )}

      {error && status !== 'Loading' && <GenericError icon="listItemNotFound" message={t('task.generic-error')} />}

      {taskId === 'not-selected' && status !== 'Loading' && (
        <GenericError icon="listItemNotFound" message={t('task.no-task-selected')} />
      )}

      {fullscreen === null && status === 'Ok' && task && (
        <AnchoredView
          header={
            status === 'Ok' && tasks && tasks.length > 1 ? (
              <TabsHeading>
                {tasks.map((item, index) => (
                  <TabsHeadingItem key={index} onClick={() => selectTask(item)} active={item === task}>
                    Attempt {index + 1}
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
                          accessor: (_item) => <StatusField status={_item.finished_at ? 'completed' : 'running'} />,
                        },
                        {
                          label: t('fields.started-at') + ':',
                          accessor: (item) => (item.ts_epoch ? getISOString(new Date(item.ts_epoch)) : ''),
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
                  <Loader
                    status={statusOut}
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
                  <Loader
                    status={statusErr}
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
                    <Loader
                      status={artifactStatus}
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

const Loader: React.FC<{ status: AsyncStatus; component: JSX.Element }> = ({ status, component }) => {
  if (status === 'Loading') {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spinner />
      </div>
    );
  }
  return component;
};

function getDuration(tasks: ITask[], task: ITask) {
  if (tasks && tasks.length > 1) {
    const attemptBefore = tasks[tasks.indexOf(task) - 1];

    if (attemptBefore && attemptBefore.duration && task.duration) {
      return formatDuration(task.duration - attemptBefore.duration);
    }
  }
  return task.duration ? formatDuration(task.duration) : '';
}

const TaskContainer = styled.div`
  display: flex;
  padding: 13px 0 25px 0;
  width: 100%;
`;

const TaskLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 2rem;
`;

export default TaskViewContainer;
