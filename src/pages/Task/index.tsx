import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParams } from 'use-query-params';
import { Run as IRun, Task as ITask, Log, Metadata } from '../../types';
import useResource from '../../hooks/useResource';
import { SearchFieldReturnType } from '../../hooks/useSearchField';
import { logWarning } from '../../utils/errorlogger';
import Plugins, { Plugin, PluginTaskSection } from '../../plugins';

import Spinner from '../../components/Spinner';
import { GraphHook } from '../../components/Timeline/useGraph';
import LogList from '../../components/LogList';
import LogActionBar from '../../components/LogList/LogActionBar';
import FullPageContainer from '../../components/FullPageContainer';
import TaskListingHeader from '../../components/TaskListingHeader';
import { Row } from '../../components/Timeline/VirtualizedTimeline';
import { RowCounts } from '../../components/Timeline/taskdataUtils';
import { RowDataAction } from '../../components/Timeline/useRowData';
import GenericError, { APIErrorRenderer, DefaultAdditionalErrorInfo } from '../../components/GenericError';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import SectionLoader from './components/SectionLoader';
import TaskDetails from './components/TaskDetails';
import AttemptSelector from './components/AttemptSelector';

//
// Typedef
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

//
// Component
//

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
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/attempts?postprocess=true`,
    subscribeToEvents: true,
    initialData: null,
    updatePredicate: (a, b) => a.attempt_id === b.attempt_id,
    pause: stepName === 'not-selected' || taskId === 'not-selected',
  });

  const attemptId = qp.attempt ? parseInt(qp.attempt) : tasks ? tasks.length - 1 : 0;
  const task = tasks?.find((item) => item.attempt_id === attemptId) || null;
  const isCurrentTaskFinished = !!(task && task.finished_at);

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
        logWarning('There war unexpected error on plugins: ', e);
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
        logWarning('There war unexpected error on plugins: ', e);
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
      logWarning('There war unexpected error on plugins: ', e);
      return [];
    }
  }, [sectionPlugins]);

  //
  // Plugins helpers end
  //
  // Related data start
  //

  const metadata = useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/metadata`,
    subscribeToEvents: true,
    initialData: [],
    pause: !isCurrentTaskFinished,
  });

  const [stdout, setStdout] = useState<Log[]>([]);
  const stdoutRes = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out`,
    queryParams: {
      attempt_id: attemptId.toString(),
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
  const stderrRes = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err`,
    queryParams: {
      attempt_id: attemptId.toString(),
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
  }, [stepName, taskId]);

  useEffect(() => {
    setStdout([]);
    setStderr([]);
  }, [attemptId]);

  return (
    <TaskContainer>
      <TaskListingHeader
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

        {status === 'Error' && (
          <Space>
            <APIErrorRenderer error={error} icon="listItemNotFound" message={t('error.load-error')} />
          </Space>
        )}

        {status === 'Ok' && tasks?.length === 0 && (
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
                <AttemptSelector tasks={tasks} currentAttempt={attemptId} onSelect={(att) => setQp({ attempt: att })} />
              }
              sections={[
                //
                // Task info
                //
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
                //
                // Stdout logs
                //
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
                        status={stdoutRes.status}
                        error={stdoutRes.error}
                        customNotFound={DefaultAdditionalErrorInfo(t('task.logs-only-available-AWS'))}
                        component={<LogList rows={stdout} onShowFullscreen={() => setFullscreen('stdout')} />}
                      />
                      {renderComponentsForSection('stdout')}
                    </>
                  ),
                },
                //
                // Strerr logs
                //
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
                        status={stderrRes.status}
                        error={stderrRes.error}
                        customNotFound={DefaultAdditionalErrorInfo(t('task.logs-only-available-AWS'))}
                        component={<LogList rows={stderr} onShowFullscreen={() => setFullscreen('stderr')} />}
                      />

                      {renderComponentsForSection('stderr')}
                    </>
                  ),
                },
                //
                // Other custom components
                //
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

//
// Style
//

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
