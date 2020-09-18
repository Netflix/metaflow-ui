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
import { RowDataModel } from '../../components/Timeline/useRowData';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import { ForceBreakText } from '../../components/Text';
import LogList from '../../components/LogList';
import FullPageContainer from '../../components/FullPageContainer';
import useSearchRequest, { SearchResult } from '../../hooks/useSearchRequest';

//
// View container
//

type TaskViewContainer = { run: IRun | null; stepName?: string; taskId?: string; rowData: RowDataModel };

const TaskViewContainer: React.FC<TaskViewContainer> = ({ run, stepName, taskId, rowData }) => {
  const { t } = useTranslation();
  if (!run?.run_number || !stepName || !taskId) {
    return <>{t('run.no-run-data')}</>;
  }

  return <Task run={run} stepName={stepName} taskId={taskId} rowData={rowData} />;
};

//
// Task view
//

type TaskViewProps = { run: IRun; stepName: string; taskId: string; rowData: RowDataModel };

const Task: React.FC<TaskViewProps> = ({ run, stepName, taskId, rowData }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [fullscreen, setFullscreen] = useState<null | 'stdout' | 'stderr'>(null);
  const { data: task, error } = useResource<ITask, ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}`,
    subscribeToEvents: true,
    initialData: null,
  });

  const { data: artifacts } = useResource<Artifact[], Artifact>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/artifacts`,
    subscribeToEvents: true,
    initialData: [],
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

  useSearchRequest({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/search`,
    searchValue: searchValue,
    onUpdate: (event: SearchResult) => {
      console.log('UPDATE', event);
    },
  });

  const [stdout, setStdout] = useState<Log[]>([]);
  useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out`,
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    onUpdate: (items) => {
      setStdout((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  const [stderr, setStderr] = useState<Log[]>([]);
  useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err`,
    subscribeToEvents: true,
    initialData: [],
    fullyDisableCache: true,
    useBatching: true,
    onUpdate: (items) => {
      setStderr((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  useEffect(() => {
    setStdout([]);
    setStderr([]);
  }, [taskId]);

  return (
    <TaskContainer>
      <TaskList rowData={rowData} activeTaskId={parseInt(taskId)} setSearchValue={setSearchValue} />

      {!task && t('task.loading')}
      {(error || (task && !task.task_id && taskId !== 'not-selected')) && t('task.could-not-find-task')}
      {taskId === 'not-selected' && t('task.no-task-selected')}

      {task && task.task_id && fullscreen === null && (
        <AnchoredView
          sections={[
            {
              key: 'taskinfo',
              order: 1,
              label: t('task.task-info'),
              component: (
                <>
                  <InformationRow spaceless>
                    <PropertyTable
                      items={[task]}
                      columns={[
                        { label: t('fields.task-id') + ':', prop: 'task_id' },
                        { label: t('items.step') + ':', prop: 'step_name' },
                        { label: t('fields.status') + ':', accessor: (_item) => <StatusField status={'completed'} /> },
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
                          accessor: (item) => (item.duration ? formatDuration(item.duration) : ''),
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
                  <LogList
                    rows={stdout.length === 0 ? [{ row: 0, line: t('task.no-logs') }] : stdout}
                    onShowFullscreen={() => setFullscreen('stdout')}
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
                  <LogList
                    rows={stderr.length === 0 ? [{ row: 0, line: t('task.no-logs') }] : stderr}
                    onShowFullscreen={() => setFullscreen('stderr')}
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

const TaskContainer = styled.div`
  display: flex;
  padding: 25px 0;
  width: 100%;
`;

export default TaskViewContainer;
