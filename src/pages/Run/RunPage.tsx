import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useResource from '../../hooks/useResource';
import useRowData from '../../components/Timeline/useRowData';
import { getPath } from '../../utils/routing';
import { Run as IRun, RunParam } from '../../types';

import TaskViewContainer from '../Task';
import { APIErrorRenderer } from '../../components/GenericError';
import Tabs from '../../components/Tabs';
import RunHeader from './RunHeader';
import DAG from '../../components/DAG';
import Timeline, { Row } from '../../components/Timeline/VirtualizedTimeline';
import useSeachField from '../../hooks/useSearchField';
import useGraph from '../../components/Timeline/useGraph';
import { getLongestRowDuration, startAndEndpointsOfRows } from '../../utils/row';
import ErrorBoundary from '../../components/GeneralErrorBoundary';
import { logWarning } from '../../utils/errorlogger';

import FEATURE from '../../FEATURE';
import { RunPageParams } from '.';
import {
  cleanParametersMap,
  getTaskFromList,
  getTaskPageLink,
  hasViewTypeParam,
  makeVisibleRows,
  sortRows,
} from './Run.utils';

//
// Typedef
//

type RunPageProps = {
  run: IRun;
  params: RunPageParams;
};

//
// Component
//

const RunPage: React.FC<RunPageProps> = ({ run, params }) => {
  const { t } = useTranslation();
  const { data: runParameters, status: runParametersStatus, error: runParameterError } = useResource<
    RunParam,
    RunParam
  >({
    url: `/flows/${params.flowId}/runs/${run.run_number}/parameters`,
    subscribeToEvents: true,
    initialData: {},
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState(hasViewTypeParam(params.viewType) ? params.viewType : 'timeline');
  useEffect(() => {
    if (hasViewTypeParam(params.viewType)) {
      setTab(params.viewType);
    } else if (params.stepName && params.taskId) {
      setTab('task');
    } else if (!params.viewType) {
      setTab('timeline');
    }
  }, [params.viewType, params.stepName, params.taskId]);

  const [previousStepName, setPreviousStepName] = useState<string>();
  const [previousTaskId, setPreviousTaskId] = useState<string>();

  useEffect(() => {
    params.stepName && params.stepName !== 'not-selected' && setPreviousStepName(params.stepName);
    params.taskId && params.stepName !== 'not-selected' && setPreviousTaskId(params.taskId);
  }, [params.stepName, params.taskId]);

  //
  // Step & Task data
  //

  const { rows, steps, dispatch, counts, taskStatus, isAnyGroupOpen, taskError, stepError } = useRowData(
    params.flowId,
    run.run_number.toString(),
  );

  //
  // Search API
  //

  const searchField = useSeachField(run.flow_id, run.run_number.toString());

  //
  // Listing settings and graph measurements
  //

  const graph = useGraph(run.ts_epoch, run.finished_at || Date.now(), run.status === 'running');
  const urlParams = new URLSearchParams(cleanParametersMap(graph.params)).toString();

  useEffect(() => {
    setPreviousStepName(params.stepName || undefined);
    setPreviousTaskId(params.taskId || undefined);
    // If there is no previous settings, lets default to some of modes.
    if (!graph.params.direction && !graph.params.order && !graph.params.status) {
      if (run.status === 'completed') {
        graph.setMode('overview');
      } else if (run.status === 'running') {
        graph.setMode('monitoring');
      } else if (run.status === 'failed') {
        graph.setMode('error-tracker');
      }
    }
  }, [params.runNumber]); // eslint-disable-line
  //
  // Graph measurements and rendering logic
  //

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [params.runNumber, dispatch]);

  //
  // Data processing
  //
  const [visibleRows, setVisibleRows] = useState<Row[]>([]);
  // Figure out rows that should be visible if something related to that changes
  // This is not most performant way to do this so we might wanna update these functionalities later on.
  useEffect(() => {
    try {
      // Filter out steps if we have step filters on.
      const visibleSteps: string[] = Object.keys(rows).filter(
        (step_name) =>
          // Check if step filter is active. Show only selected steps
          (graph.graph.stepFilter.length === 0 || graph.graph.stepFilter.indexOf(step_name) > -1) &&
          // Filter out steps starting with _ since they are not interesting to user
          !step_name.startsWith('_'),
      );

      // Make list of rows. Note that in list steps and tasks are equal rows, they are just rendered a bit differently
      const newRows: Row[] = makeVisibleRows(rows, graph.graph, visibleSteps, searchField.results);
      // If no grouping, sort tasks here.
      const rowsToUpdate = !graph.graph.group
        ? newRows.sort(sortRows(graph.graph.sortBy, graph.graph.sortDir))
        : newRows;

      // Figure out new timings to timeline view
      // TODO: Move this to somewhere else
      const timings = startAndEndpointsOfRows([...rowsToUpdate]);
      const endTime =
        graph.graph.sortBy === 'duration' ? run.ts_epoch + getLongestRowDuration(rowsToUpdate) : timings.end;

      if (timings.start !== 0 && endTime !== 0) {
        graph.dispatch({
          type: 'init',
          start: run.ts_epoch,
          end: endTime,
        });
      }
      setVisibleRows(rowsToUpdate);
    } catch (e) {
      logWarning('Unexpected error while contructing task rows: ', e);
    }
    /* eslint-disable */
  }, [
    rows,
    graph.graph.stepFilter,
    graph.graph.sortBy,
    graph.graph.sortDir,
    graph.graph.statusFilter,
    graph.graph.group,
    searchField.results,
  ]);

  return (
    <>
      <ErrorBoundary message={t('error.run-header-error')}>
        <RunHeader run={run} parameters={runParameters} status={runParametersStatus} error={runParameterError} />
      </ErrorBoundary>
      <Tabs
        activeTab={tab}
        tabs={[
          ...(FEATURE.DAG
            ? [
                {
                  key: 'dag',
                  label: t('run.DAG'),
                  linkTo: getPath.dag(params.flowId, params.runNumber) + '?' + urlParams,
                  component: (
                    <ErrorBoundary message={t('error.dag-error')}>
                      <DAG run={run} steps={steps} />
                    </ErrorBoundary>
                  ),
                },
              ]
            : []),
          {
            key: 'timeline',
            label: t('run.timeline'),
            linkTo: getPath.timeline(params.flowId, params.runNumber) + '?' + urlParams,
            component: (
              <ErrorBoundary message={t('error.timeline-error')}>
                {(taskError || stepError) && visibleRows.length === 0 ? (
                  <APIErrorRenderer error={taskError || stepError} />
                ) : (
                  <Timeline
                    rows={visibleRows}
                    rowDataDispatch={dispatch}
                    status={taskStatus}
                    counts={counts}
                    graph={graph}
                    searchField={searchField}
                    paramsString={urlParams}
                    isAnyGroupOpen={isAnyGroupOpen}
                  />
                )}
              </ErrorBoundary>
            ),
          },
          {
            key: 'task',
            label: previousTaskId ? `${t('items.task')}: ${previousTaskId}` : `${t('items.task')}`,
            linkTo: getTaskPageLink(params.flowId, params.runNumber, previousStepName, previousTaskId, urlParams, rows),
            component: (
              <ErrorBoundary message={t('error.task-error')}>
                {taskError || stepError ? (
                  <APIErrorRenderer error={taskError || stepError} />
                ) : (
                  <TaskViewContainer
                    run={run}
                    taskFromList={getTaskFromList(rows, params.stepName, params.taskId)}
                    stepName={previousStepName || 'not-selected'}
                    taskId={previousTaskId || 'not-selected'}
                    rows={visibleRows}
                    taskStatus={taskStatus}
                    rowDataDispatch={dispatch}
                    searchField={searchField}
                    graph={graph}
                    counts={counts}
                    paramsString={urlParams}
                    isAnyGroupOpen={isAnyGroupOpen}
                  />
                )}
              </ErrorBoundary>
            ),
          },
        ]}
      />
    </>
  );
};

export default RunPage;
