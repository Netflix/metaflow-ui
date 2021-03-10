import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParams } from 'use-query-params';
import { Run as IRun, Task as ITask, Log, Metadata, AsyncStatus } from '../../types';
import useResource from '../../hooks/useResource';
import { SearchFieldReturnType } from '../../hooks/useSearchField';

import Spinner from '../../components/Spinner';
import { GraphHook } from '../../components/Timeline/useGraph';
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
import { getTaskId } from '../../utils/task';

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
  taskFromList,
  stepName,
  taskId,
  rows,
  rowDataDispatch,
  taskStatus,
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
  const { data: tasksFromFetch, status, error } = useResource<ITask[], ITask>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/steps/${stepName}/tasks/${taskId}/attempts?postprocess=true`,
    subscribeToEvents: true,
    initialData: null,
    updatePredicate: (a, b) => a.attempt_id === b.attempt_id,
    pause: stepName === 'not-selected' || taskId === 'not-selected' || !!taskFromList,
  });

  const tasks = taskFromList || tasksFromFetch;

  const attemptId = qp.attempt ? parseInt(qp.attempt) : tasks ? tasks.length - 1 : 0;
  const task = tasks?.find((item) => item.attempt_id === attemptId) || null;
  const isCurrentTaskFinished = !!(task && task.finished_at);

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
          taskStatus={taskStatus}
          activeTaskId={taskId}
          results={searchField.results}
          grouped={graph.graph.group}
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
                      <TaskDetails task={task} metadata={metadata} />
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
                      setFullscreen={() => setFullscreen('stdout')}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={(stdout || []).length > 0 ? 'Ok' : stdoutRes.status}
                        error={stdoutRes.error}
                        component={<LogList rows={stdout} onShowFullscreen={() => setFullscreen('stdout')} />}
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
                      setFullscreen={() => setFullscreen('stderr')}
                    />
                  ),
                  component: (
                    <>
                      <SectionLoader
                        minHeight={110}
                        status={(stderr || []).length > 0 ? 'Ok' : stderrRes.status}
                        error={stderrRes.error}
                        component={<LogList rows={stderr} onShowFullscreen={() => setFullscreen('stderr')} />}
                      />
                    </>
                  ),
                },
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
