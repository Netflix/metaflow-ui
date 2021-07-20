import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SetQuery, StringParam, useQueryParams } from 'use-query-params';
import { Run as IRun, Task as ITask, Log, Metadata, AsyncStatus, Artifact } from '../../types';
import useResource, { Resource } from '../../hooks/useResource';
import { SearchFieldReturnType } from '../../hooks/useSearchField';

import Spinner from '../../components/Spinner';
import LogList from '../../components/LogList';
import LogActionBar from '../../components/LogList/LogActionBar';
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
import { DAGModel } from '../../components/DAG/DAGUtils';
import { PluginsContext } from '../../components/Plugins/PluginManager';

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
  dagResult: Resource<DAGModel>;
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
  const { addDataToStore } = useContext(PluginsContext);

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

  //
  // Related data start
  //

  // Metadata
  const [metadata, setMetadata] = useState<Metadata[]>([]);
  const metadataRes = useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/metadata`,
    fetchAllData: true,
    queryParams: {
      _limit: '100',
    },
    subscribeToEvents: true,
    initialData: [],
    pause: !isCurrentTaskFinished,
    onUpdate(items) {
      setMetadata((oldItems) => {
        const newSet = [...oldItems, ...items];
        addDataToStore('metadata', newSet);
        return newSet;
      });
    },
  });

  const logParams = {
    attempt_id: attemptId.toString(),
    _limit: '500',
  };

  // Stantard out logs
  const [stdout, setStdout] = useState<Log[]>([]);
  const stdoutRes = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/out`,
    queryParams: logParams,
    initialData: [],
    fetchAllData: true,
    pause: !isCurrentTaskFinished,
    onUpdate: (items) => {
      items && setStdout((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  // Error logs
  const [stderr, setStderr] = useState<Log[]>([]);
  const stderrRes = useResource<Log[], Log>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/logs/err`,
    queryParams: logParams,
    initialData: [],
    fetchAllData: true,
    pause: !isCurrentTaskFinished,
    onUpdate: (items) => {
      items && setStderr((l) => l.concat(items).sort((a, b) => a.row - b.row));
    },
  });

  // Artifacts
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const artifactUrl = `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/artifacts`;
  const { status: artifactStatus, error: artifactError } = useResource<Artifact[], Artifact>({
    url: artifactUrl,
    queryParams: {
      attempt_id: attemptId !== null ? attemptId.toString() : '',
      postprocess: 'true',
      _limit: '50',
    },
    subscribeToEvents: true,
    fetchAllData: true,
    initialData: [],
    onUpdate: (data) => {
      data && setArtifacts((currentData) => [...currentData, ...data]);
    },
    pause: !isCurrentTaskFinished || attemptId === null,
  });

  useEffect(() => {
    setMetadata([]);
  }, [stepName, taskId]);

  useEffect(() => {
    setStdout([]);
    setStderr([]);
    setArtifacts([]);
  }, [stepName, taskId, attemptId]);

  const developerNote = getDocString(dagResult, stepName);

  useEffect(() => {
    addDataToStore('task', task);
  }, [task, addDataToStore]);

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
                        metadata={metadata}
                        metadataResource={metadataRes}
                        developerNote={developerNote}
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
                  actionbar: (
                    <LogActionBar
                      data={stdout}
                      name={`stdout-${task.ts_epoch}-${getTaskId(task)}-attempt${task.attempt_id}`}
                      setFullscreen={() => setFullscreen({ type: 'logs', logtype: 'stdout' })}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={(stdout || []).length > 0 ? 'Ok' : stdoutRes.status}
                        error={stdoutRes.error}
                        component={<LogList rows={stdout} />}
                      />
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
                      setFullscreen={() => setFullscreen({ type: 'logs', logtype: 'stderr' })}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={(stderr || []).length > 0 ? 'Ok' : stderrRes.status}
                        error={stderrRes.error}
                        component={<LogList rows={stderr} />}
                      />
                    </>
                  ),
                },
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
                                  artifacts={artifacts}
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
              ].sort((a, b) => a.order - b.order)}
            />
          </>
        )}
      </div>
      {fullscreen && task && (
        <FullPageContainer
          onClose={() => setFullscreen(null)}
          actionbar={
            fullscreen.type === 'logs' ? (
              <LogActionBar
                data={fullscreen.logtype === 'stdout' ? stdout : stderr}
                name={`${fullscreen.logtype}-${task.ts_epoch}-${getTaskId(task)}-attempt${task.attempt_id}`}
              />
            ) : (
              <ArtifactActionBar
                data={fullscreen.artifactdata}
                name={`${fullscreen.name}-${task.ts_epoch}-${getTaskId(task)}-attempt${task.attempt_id}`}
              />
            )
          }
          title={fullscreen.type === 'logs' ? fullscreen.logtype : fullscreen.name}
          component={(height) => {
            if (fullscreen.type === 'logs') {
              return <LogList rows={fullscreen.logtype === 'stdout' ? stdout : stderr} fixedHeight={height} />;
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

function getDocString(dagResult: Resource<DAGModel>, stepName: string): string | null {
  if (dagResult.data) {
    const dagItem = dagResult.data[stepName];

    if (dagItem && dagItem.doc) {
      return dagItem.doc;
    }
    return null;
  }
  return null;
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
