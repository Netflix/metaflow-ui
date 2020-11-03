import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';
import { useTranslation } from 'react-i18next';
import { Run as IRun, Task as ITask, Artifact, Log } from '../../types';
import useResource from '../../hooks/useResource';

import Plugins, { Plugin, PluginTaskSection } from '../../plugins';
import { RowCounts, RowDataAction } from '../../components/Timeline/useRowData';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import { ForceBreakText } from '../../components/Text';
import LogList from '../../components/LogList';
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
  setMode: (str: string) => void;
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
  setMode,
  paramsString,
  isAnyGroupOpen,
}) => {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<null | 'stdout' | 'stderr'>(null);
  const [task, setTask] = useState<ITask | null>(null);
  const [qp, setQp] = useQueryParams({
    section: StringParam,
  });

  if (qp.section) {
    const section = 'section=' + qp.section;
    paramsString = paramsString ? `${paramsString}&${section}` : section;
  }

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

  useEffect(() => {
    setStdout([]);
    setStderr([]);
  }, [attemptId]);

  const selectTask = (task: ITask) => {
    setTask(task);
  };

  return (
    <TaskContainer>
      <TimelineHeader
        graph={graph}
        setMode={setMode}
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
              setSection={(value: string | null) => setQp({ section: value })}
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
                      <TaskDetails task={task} attempts={tasks || []} />
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
                {
                  key: 'artifacts',
                  order: 4,
                  label: t('task.artifacts'),
                  component: (
                    <>
                      <InformationRow spaceless>
                        <SectionLoader
                          minHeight={200}
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
