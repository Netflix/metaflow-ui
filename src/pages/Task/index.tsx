import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Run as IRun, Task as ITask, Log, AsyncStatus, Metadata } from '../../types';
import useResource from '../../hooks/useResource';

import Plugins, { Plugin, PluginTaskSection } from '../../plugins';
import { RowCounts, RowDataAction } from '../../components/Timeline/useRowData';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import LogList, { LogActionBar } from '../../components/LogList';
import FullPageContainer from '../../components/FullPageContainer';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import Spinner from '../../components/Spinner';
import GenericError, { DefaultAdditionalErrorInfo } from '../../components/GenericError';
import { TabsHeading, TabsHeadingItem } from '../../components/Tabs';
import SectionLoader from './components/SectionLoader';
import { Row } from '../../components/Timeline/VirtualizedTimeline';
import TimelineHeader from '../../components/Timeline/TimelineHeader';
import { GraphHook } from '../../components/Timeline/useGraph';
import TaskDetails from './components/TaskDetails';
import { StringParam, useQueryParams } from 'use-query-params';

//
// Task view
//

type TaskViewProps = {
  run: IRun;
  stepName: string;
  taskId: string;
  rows: Row[];
  rowDataDispatch: (action: RowDataAction) => void;
  graph: GraphHook;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
  paramsString: string;
  isAnyGroupOpen: boolean;
};

const sortTaskAttempts = (a: ITask, b: ITask) => a.attempt_id - b.attempt_id;

const Task: React.FC<TaskViewProps> = ({
  run,
  stepName,
  taskId,
  rows,
  rowDataDispatch,
  graph,
  searchField,
  counts,
  paramsString,
  isAnyGroupOpen,
}) => {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<null | 'stdout' | 'stderr'>(null);
  const [selectedTaskId, setTask] = useState<string | null>(null);

  //
  // Query params
  //
  const [qp, setQp] = useQueryParams({
    section: StringParam,
    attempt: StringParam,
  });

  // If section is in URL, lets add it to params string so we take it to task links
  if (qp.section) {
    const section = 'section=' + qp.section;
    paramsString = paramsString ? `${paramsString}&${section}` : section;
  }

  //
  // Task/attempt data
  //
  const { data: tasks, status, error } = useResource<ITask[], ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/attempts`,
    subscribeToEvents: true,
    initialData: null,
    updatePredicate: (a, b) => a.attempt_id === b.attempt_id,
    pause: stepName === 'not-selected' || taskId === 'not-selected',
  });

  const attemptId = qp.attempt || null;

  const task = useMemo(() => {
    return tasks?.find((item) => item.task_id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]); // eslint-disable-line

  const isCurrentTaskFinished = !!(task && task.finished_at);

  const metadata = useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/metadata`,
    subscribeToEvents: true,
    initialData: [],
    pause: !isCurrentTaskFinished || attemptId === null,
  });

  // Task data will be array so we need to set one of them as active task when they arrive depending if we
  // have attempt id parameter or not.
  useEffect(() => {
    const attempts = tasks || [];

    if (shouldUpdateTask(status, task, attempts, attemptId)) {
      if (typeof attemptId === 'string') {
        const item =
          attempts.find((i) => i.attempt_id === parseInt(attemptId)) ||
          attempts.sort(sortTaskAttempts)[attempts.length - 1];

        setTask(item ? item.task_id : null);
      } else {
        const item = attempts.sort(sortTaskAttempts)[attempts.length - 1];
        setTask(item ? item.task_id : null);
      }
    }
  }, [tasks, status, task, attemptId]);

  useEffect(() => {
    if (task && task.attempt_id !== parseInt(attemptId || '')) {
      setQp({ attempt: task.attempt_id.toString() }, 'replaceIn');
    }
  }, [task]); // eslint-disable-line

  //
  // Plugins helpers begin
  //
  const sectionPlugins = useMemo(() => Plugins.all().filter((plugin) => plugin['task-view']?.sections), []);

  const pluginComponentsForSection = useMemo(
    () => (sectionKey: string) => {
      try {
        return sectionPlugins.reduce((components: PluginTaskSection[], plugin: Plugin) => {
          const sectionMatches = (plugin['task-view']?.sections || []).filter((section) => section.key === sectionKey);
          return [...components, ...sectionMatches];
        }, []);
      } catch (e) {
        console.warn('There war unexpected error on plugins: ', e);
        return [];
      }
    },
    [sectionPlugins],
  );
  const renderComponentsForSection = useMemo(
    () => (sectionKey: string) => {
      try {
        return pluginComponentsForSection(sectionKey).map(({ component: Component }, index) => {
          return Component ? <Component key={index} task={task} artifacts={null} /> : null;
        });
      } catch (e) {
        console.warn('There war unexpected error on plugins: ', e);
        return [];
      }
    },
    [task, pluginComponentsForSection],
  );
  const pluginSectionsCustom = useMemo(() => {
    try {
      return sectionPlugins
        .reduce((sections: string[], plugin: Plugin) => {
          const sectionKeys = (plugin['task-view']?.sections || []).map((section) => section.key);
          return [...sections, ...sectionKeys];
        }, []) // Find section keys from plugins
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .filter((key) => !['taskinfo', 'stdout', 'stderr', 'artifacts'].includes(key)); // Ignore built-in sections
    } catch (e) {
      console.warn('There war unexpected error on plugins: ', e);
      return [];
    }
  }, [sectionPlugins]);

  //
  // Plugins helpers end
  // Logs start
  //

  const [stdout, setStdout] = useState<Log[]>([]);
  const { status: statusOut, error: logStdError } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out`,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId : '',
    },
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: !isCurrentTaskFinished || attemptId === null,
    onUpdate: (items) => {
      items && setStdout((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  const [stderr, setStderr] = useState<Log[]>([]);
  const { status: statusErr, error: logErrError } = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err`,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId : '',
    },
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    pause: !isCurrentTaskFinished || attemptId === null,
    onUpdate: (items) => {
      items && setStderr((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  useEffect(() => {
    setStdout([]);
    setStderr([]);
    setTask(null);
  }, [stepName, taskId]);

  useEffect(() => {
    setStdout([]);
    setStderr([]);
  }, [attemptId]);

  return (
    <TaskContainer>
      <TimelineHeader
        graph={graph}
        expandAll={() => rowDataDispatch({ type: 'openAll' })}
        collapseAll={() => rowDataDispatch({ type: 'closeAll' })}
        searchField={searchField}
        counts={counts}
        isAnyGroupOpen={isAnyGroupOpen}
      />

      <div style={{ display: 'flex' }}>
        <TaskList
          rows={rows}
          rowDataDispatch={rowDataDispatch}
          activeTaskId={taskId}
          results={searchField.results}
          grouped={graph.graph.group}
          paramsString={paramsString}
        />

        {status === 'Loading' && (
          <TaskLoaderContainer>
            <Spinner md />
          </TaskLoaderContainer>
        )}

        {error && status !== 'Loading' && status !== 'Ok' && (
          <Space>
            <GenericError icon="listItemNotFound" message={t('error.load-error')} />
          </Space>
        )}

        {status === 'Ok' && tasks && tasks.length === 0 && (
          <Space>
            <GenericError icon="listItemNotFound" message={t('error.not-found')} />
          </Space>
        )}

        {taskId === 'not-selected' && status !== 'Loading' && (
          <Space>
            <GenericError icon="listItemNotFound" message={t('task.no-task-selected')} />
          </Space>
        )}

        {fullscreen === null && status === 'Ok' && task && (
          <>
            <AnchoredView
              activeSection={qp.section}
              setSection={(value: string | null) => setQp({ section: value }, 'replaceIn')}
              header={
                status === 'Ok' && tasks && tasks.length > 0 ? (
                  <TabsHeading>
                    {tasks.sort(sortTaskAttempts).map((item: ITask, index) => (
                      <TabsHeadingItem
                        key={index}
                        onClick={() =>
                          setQp({ attempt: typeof item.attempt_id === 'number' ? item.attempt_id.toString() : null })
                        }
                        active={item?.attempt_id.toString() === attemptId}
                      >
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
                      <TaskDetails task={task} attempts={tasks || []} metadata={metadata} />

                      {renderComponentsForSection('taskinfo')}
                    </>
                  ),
                },
                {
                  key: 'stdout',
                  order: 2,
                  label: t('task.std-out'),
                  actionbar: (
                    <LogActionBar
                      data={stdout}
                      name={`stdout-${task.ts_epoch}-${task.task_id}-attempt${task.attempt_id}`}
                      setFullscreen={() => setFullscreen('stdout')}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
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
                  actionbar: (
                    <LogActionBar
                      data={stderr}
                      name={`stderr-${task.ts_epoch}-${task.task_id}-attempt${task.attempt_id}`}
                      setFullscreen={() => setFullscreen('stderr')}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
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
                          return Component ? <Component key={index} task={task} artifacts={null} /> : null;
                        })}
                      </>
                    ),
                  };
                }),
              ].sort((a, b) => a.order - b.order)}
            />
          </>
        )}
      </div>
      {fullscreen && (
        <FullPageContainer
          onClose={() => setFullscreen(null)}
          component={(height) => <LogList rows={fullscreen === 'stdout' ? stdout : stderr} fixedHeight={height} />}
        ></FullPageContainer>
      )}
    </TaskContainer>
  );
};

function shouldUpdateTask(status: AsyncStatus, task: ITask | null, tasks: ITask[], attempt: string | null): boolean {
  // We need to have tasks to update view
  if (status !== 'Ok') return false;
  // If no attempt selected, do it now
  if (!attempt && tasks && tasks.length > 0) {
    return true;
  }
  // If attempt was changed
  if (
    (task === null || (typeof attempt === 'string' && task.attempt_id !== parseInt(attempt))) &&
    tasks &&
    tasks.length > 0
  ) {
    return true;
  }

  return false;
}

const TaskContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 1000px;
  flex-direction: column;
`;

const TaskLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 2rem;
`;

const Space = styled.div`
  margin: 1rem 0;
  width: 100%;
`;

export default Task;
