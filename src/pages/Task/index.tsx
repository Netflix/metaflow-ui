import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SetQuery, StringParam, useQueryParams } from 'use-query-params';
import { Run as IRun, Task as ITask, AsyncStatus, Artifact } from '../../types';
import useResource, { Resource } from '../../hooks/useResource';
import { SearchFieldReturnType } from '../../hooks/useSearchField';

import Spinner from '../../components/Spinner';
import LogList from '../../components/LogList';
import FullPageContainer from '../../components/FullPageContainer';
import TaskListingHeader from '../../components/TaskListingHeader';
import { Row } from '../../components/Timeline/VirtualizedTimeline';
import { RowCounts } from '../../components/Timeline/taskdataUtils';
import { RowDataAction } from '../../components/Timeline/useTaskData';
import GenericError, { APIErrorRenderer } from '../../components/GenericError';
import TaskList from './components/TaskList';
import AnchoredView from './components/AnchoredView';
import SectionLoader from './components/SectionLoader';
import TaskDetails from './components/TaskDetails';
import AttemptSelector from './components/AttemptSelector';
import ArtifactTable from './components/ArtifactTable';
import ArtifactViewer from './components/ArtifactViewer';
import ArtifactActionBar from './components/ArtifactActionBar';
import { getTaskId } from '../../utils/task';
import {
  TaskListMode,
  TaskSettingsQueryParameters,
  TaskSettingsState,
} from '../../components/Timeline/useTaskListSettings';
import FEATURE_FLAGS from '../../utils/FEATURE';
import { isVersionEqualOrHigher } from '../../components/Plugins/PluginManager';
import { GraphModel } from '../../components/DAG/DAGUtils';
import useLogData, { LogData } from '../../hooks/useLogData';
import { apiHttp } from '../../constants';
import useTaskMetadata from './useTaskMetadata';
import { getTagOfType } from '../../utils/run';
import useTaskCards, { taskCardPath } from '../../components/MFCard/useTaskCards';
import CardIframe from '../../components/MFCard/CardIframe';
import Button from '../../components/Button';
import Icon from '../../components/Icon';

//
// Typedef
//

type TaskViewProps = {
  run: IRun;
  taskFromList: ITask[] | null;
  stepName: string;
  taskId: string;
  rows: Row[];
  rowDataDispatch: (action: RowDataAction) => void;
  taskStatus: AsyncStatus;
  settings: TaskSettingsState;
  searchField: SearchFieldReturnType;
  counts: RowCounts;
  paramsString: string;
  isAnyGroupOpen: boolean;
  setQueryParam: SetQuery<TaskSettingsQueryParameters>;
  onModeSelect: (mode: TaskListMode) => void;
  dagResult: Resource<GraphModel>;
};

type FullScreenData =
  | { type: 'logs'; logtype: 'stdout' | 'stderr' }
  | { type: 'artifact'; name: string; artifactdata: string };

//
// Component
//

const Task: React.FC<TaskViewProps> = ({
  run,
  taskFromList,
  stepName,
  taskId,
  rows,
  rowDataDispatch,
  taskStatus,
  settings,
  searchField,
  counts,
  paramsString,
  isAnyGroupOpen,
  setQueryParam,
  onModeSelect,
  dagResult,
}) => {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<null | FullScreenData>(null);

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
  // This is only used if we dont have data already from tasks listing.
  //
  const {
    data: tasksFromFetch,
    status,
    error,
  } = useResource<ITask[], ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/attempts?postprocess=true`,
    subscribeToEvents: true,
    initialData: null,
    updatePredicate: (a, b) => a.attempt_id === b.attempt_id,
    pause: stepName === 'not-selected' || taskId === 'not-selected' || !!taskFromList,
  });

  const tasks = taskFromList || tasksFromFetch;

  // Use attempt id from query parameters OR biggest attemmpt id available
  const attemptId = qp.attempt
    ? parseInt(qp.attempt)
    : tasks
    ? tasks.map((item) => item.attempt_id).sort((a, b) => b - a)[0]
    : 0;
  const task = tasks?.find((item) => item.attempt_id === attemptId) || null;
  const isCurrentTaskFinished = !!(task && task.finished_at);
  const isLatestAttempt = attemptId === (tasks?.length || 1) - 1;

  //
  // Related data start
  //

  // Metadata
  const metadata = useTaskMetadata({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${task?.task_id}/metadata`,
    attemptId: attemptId,
    paused: !task,
  });

  const logUrl = `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${task?.task_id}/logs/`;

  // Stantard out logs
  const stdout = useLogData({
    paused: !isCurrentTaskFinished,
    preload: task?.status === 'running',
    url: `${logUrl}out?attempt_id=${attemptId.toString()}`,
  });

  // Error logs
  const stderr = useLogData({
    paused: !isCurrentTaskFinished,
    preload: task?.status === 'running',
    url: `${logUrl}err?attempt_id=${attemptId.toString()}`,
  });

  // Artifacts
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const artifactUrl = `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${task?.task_id}/artifacts`;
  const { status: artifactStatus, error: artifactError } = useResource<Artifact[], Artifact>({
    url: artifactUrl,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId.toString() : '',
      postprocess: 'true',
      _limit: '50',
    },
    socketParamFilter: ({ postprocess, ...rest }) => {
      return rest;
    },
    subscribeToEvents: true,
    fetchAllData: true,
    initialData: [],
    onUpdate: (data) => {
      data && setArtifacts((currentData) => [...currentData, ...data]);
    },
    pause: !task || attemptId === null,
  });

  useEffect(() => {
    setArtifacts([]);
  }, [stepName, taskId, attemptId]);

  const developerNote = getDocString(dagResult, stepName);

  //
  // Cards
  //

  const cards = useTaskCards(task);

  return (
    <TaskContainer>
      <TaskListingHeader
        run={run}
        settings={settings}
        onToggleCollapse={(type: 'expand' | 'collapse') =>
          rowDataDispatch({ type: type === 'expand' ? 'openAll' : 'closeAll' })
        }
        searchField={searchField}
        counts={counts}
        isAnyGroupOpen={isAnyGroupOpen}
        onModeSelect={onModeSelect}
        setQueryParam={setQueryParam}
      />

      <div style={{ display: 'flex' }}>
        <TaskList
          rows={rows}
          rowDataDispatch={rowDataDispatch}
          taskStatus={taskStatus}
          activeTaskId={taskId}
          results={searchField.results}
          grouped={settings.group}
          paramsString={paramsString}
        />

        {status === 'Loading' && !taskFromList && (
          <TaskLoaderContainer>
            <Spinner md />
          </TaskLoaderContainer>
        )}

        {status === 'Error' && !taskFromList && (
          <Space>
            <APIErrorRenderer error={error} icon="listItemNotFound" message={t('error.load-error')} />
          </Space>
        )}

        {status === 'Ok' && tasks?.length === 0 && !taskFromList && (
          <Space>
            <GenericError icon="listItemNotFound" message={t('error.not-found')} />
          </Space>
        )}

        {fullscreen === null && (status === 'Ok' || taskFromList) && task && (
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
                      <TaskDetails
                        run={run}
                        task={task}
                        metadata={metadata.data}
                        metadataResource={metadata.taskMetadataResource}
                        developerNote={developerNote}
                        showMetadata={shouldShowMetadata(run) || isLatestAttempt}
                      />
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
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={getLogSectionStatus(stdout)}
                        error={stdout.error}
                        component={
                          <LogList
                            onScroll={stdout.loadMore}
                            logdata={stdout}
                            downloadUrl={apiHttp(`${logUrl}/out/download?attempt_id=${task.attempt_id}`)}
                            setFullscreen={() => setFullscreen({ type: 'logs', logtype: 'stdout' })}
                          />
                        }
                      />
                      {task.status === 'pending' && t('task.waiting-for-task-to-start')}
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
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={getLogSectionStatus(stderr)}
                        error={stderr.error}
                        component={
                          <LogList
                            onScroll={stderr.loadMore}
                            logdata={stderr}
                            downloadUrl={apiHttp(`${logUrl}/err/download?attempt_id=${task.attempt_id}`)}
                            setFullscreen={() => setFullscreen({ type: 'logs', logtype: 'stderr' })}
                          />
                        }
                      />
                      {task.status === 'pending' && t('task.waiting-for-task-to-start')}
                    </>
                  ),
                },
                // Render artifacts if enabled by feature flags.
                ...(FEATURE_FLAGS.ARTIFACT_TABLE
                  ? [
                      {
                        key: 'artifacts',
                        order: 4,
                        label: t('task.artifacts'),
                        component: (
                          <>
                            <SectionLoader
                              minHeight={110}
                              status={artifactStatus}
                              error={artifactError}
                              component={
                                <ArtifactTable
                                  artifacts={artifacts.filter((art) => !art.name.startsWith('_'))}
                                  onOpenContentClick={(name, data) =>
                                    setFullscreen({ type: 'artifact', name, artifactdata: data })
                                  }
                                />
                              }
                            />
                          </>
                        ),
                      },
                    ]
                  : []),
                // Render cards at the end of sections if enabled by feature flags.
                ...(FEATURE_FLAGS.CARDS && cards.status === 'Ok' && cards.data
                  ? cards.data.map((def) => ({
                      key: def.hash,
                      order: 99,
                      label: def.id ? `${t('card.card_id_title')}: ${def.id}` : `${t('card.card_title')}: ${def.type}`,
                      actionbar: (
                        <a
                          title={t('card.download_card')}
                          href={apiHttp(taskCardPath(task, def.hash))}
                          download
                          data-testid="card-download"
                        >
                          <Button
                            onClick={() => {
                              /*intentional*/
                            }}
                            iconOnly
                          >
                            <Icon name="download" size="sm" />
                          </Button>
                        </a>
                      ),
                      component: <CardIframe path={`${taskCardPath(task, def.hash)}?embed=true`} />,
                    }))
                  : []),
              ].sort((a, b) => a.order - b.order)}
            />
          </>
        )}
      </div>
      {fullscreen && task && (
        <FullPageContainer
          onClose={() => setFullscreen(null)}
          actionbar={
            fullscreen.type === 'logs' ? null : (
              <ArtifactActionBar
                data={fullscreen.artifactdata}
                name={`${fullscreen.name}-${task.ts_epoch}-${getTaskId(task)}-attempt${task.attempt_id}`}
              />
            )
          }
          title={fullscreen.type === 'logs' ? fullscreen.logtype : fullscreen.name}
          component={(height) => {
            if (fullscreen.type === 'logs') {
              return (
                <LogList
                  logdata={fullscreen.logtype === 'stdout' ? stdout : stderr}
                  onScroll={fullscreen.logtype === 'stdout' ? stdout.loadMore : stderr.loadMore}
                  fixedHeight={height - 56}
                  downloadUrl={apiHttp(
                    `${logUrl}/${fullscreen.logtype === 'stdout' ? 'out' : 'err'}/download?attempt_id=${
                      task.attempt_id
                    }`,
                  )}
                />
              );
            } else if (fullscreen.type === 'artifact') {
              return <ArtifactViewer data={fullscreen.artifactdata} height={height} />;
            }
            return <div />;
          }}
        ></FullPageContainer>
      )}
    </TaskContainer>
  );
};

//
// Utils
//

function getDocString(dagResult: Resource<GraphModel>, stepName: string): string | null {
  if (dagResult.data) {
    const dagItem = dagResult.data.steps_info[stepName];

    if (dagItem && dagItem.doc) {
      return dagItem.doc;
    }
    return null;
  }
  return null;
}

function getLogSectionStatus(logdata: LogData): AsyncStatus {
  return logdata.logs.length > 0 ? 'Ok' : logdata.preloadStatus === 'Loading' ? 'Loading' : logdata.status;
}

function shouldShowMetadata(run: IRun) {
  const v = getTagOfType(run.system_tags, 'metaflow_version');

  if (v) {
    if (v.startsWith('1.')) {
      return isVersionEqualOrHigher(v, '1.22.5');
    } else if (v.startsWith('2.')) {
      return isVersionEqualOrHigher(v, '2.4.0');
    }
    return false;
  } else {
    return false;
  }
}

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
