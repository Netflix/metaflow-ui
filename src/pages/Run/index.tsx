import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import useResource from '../../hooks/useResource';
import useRowData from '../../components/Timeline/useRowData';
import { getPath } from '../../utils/routing';
import { Run as IRun, RunParam, Step } from '../../types';

import TaskViewContainer from '../Task';
import Spinner from '../../components/Spinner';
import GenericError from '../../components/GenericError';
import Tabs from '../../components/Tabs';
import { FixedContent, ItemRow } from '../../components/Structure';
import RunHeader from './RunHeader';
import DAG from '../../components/DAG';
import Timeline, {
  Row,
  makeVisibleRows,
  findHighestTimestampForGraph,
  sortRows,
} from '../../components/Timeline/VirtualizedTimeline';
import useSeachField from '../../hooks/useSearchField';
import useGraph from '../../components/Timeline/useGraph';

type RunPageParams = {
  flowId: string;
  runNumber: string;
  viewType?: string;
  stepName?: string;
  taskId?: string;
};

const RunContainer: React.FC = () => {
  const { t } = useTranslation();
  const { params } = useRouteMatch<RunPageParams>();

  const { data: run, status, error } = useResource<IRun, IRun>({
    url: `/flows/${params.flowId}/runs/${params.runNumber}`,
    subscribeToEvents: true,
    initialData: null,
  });

  return (
    <FixedContent>
      {status === 'Loading' && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Spinner md />
        </div>
      )}

      {status === 'Error' && error && (
        <ItemRow margin="lg">
          <GenericError message={t('timeline.no-run-data')} />
        </ItemRow>
      )}

      {status === 'Ok' && run && run.run_number && <RunPage run={run} params={params} />}
    </FixedContent>
  );
};

type RunPageProps = {
  run: IRun;
  params: RunPageParams;
};

const RunPage: React.FC<RunPageProps> = ({ run, params }) => {
  const { t } = useTranslation();
  const { data: runParameters, status: runParametersStatus, error: runParameterError } = useResource<
    RunParam,
    RunParam
  >({
    url: `/flows/${params.flowId}/runs/${params.runNumber}/parameters`,
    subscribeToEvents: true,
    initialData: {},
  });

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState('timeline');
  useEffect(() => {
    if (params.viewType && ['dag', 'timeline', 'task'].indexOf(params.viewType) > -1) {
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
    setPreviousStepName(undefined);
    setPreviousTaskId(undefined);

    if (run.status === 'completed') {
      setMode('overview');
    } else if (run.status === 'running') {
      setMode('monitoring');
    } else if (run.status === 'failed') {
      setMode('error-tracker');
    }
  }, [params.runNumber]); // eslint-disable-line

  useEffect(() => {
    params.stepName && params.stepName !== 'not-selected' && setPreviousStepName(params.stepName);
    params.taskId && params.stepName !== 'not-selected' && setPreviousTaskId(params.taskId);
  }, [params.stepName, params.taskId]);

  //
  // Step & Task data
  //

  const { rows, steps, dispatch, counts, taskStatus, isAnyGroupOpen } = useRowData(params.flowId, params.runNumber);

  //
  // Search API
  //

  const searchField = useSeachField(run.flow_id, run.run_number);

  //
  // Listing settings and graph measurements
  //

  const graph = useGraph(run.ts_epoch, run.finished_at || Date.now());
  const urlParams = new URLSearchParams(cleanParametersMap(graph.params)).toString();
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
    // Filter out steps if we have step filters on.
    const visibleSteps: Step[] = Object.keys(rows)
      .map((key) => rows[key].step)
      .filter(
        (item): item is Step =>
          // Filter out possible undefined (should not really happen, might though if there is some timing issues with REST and websocket)
          item !== undefined &&
          // Check if step filter is active. Show only selected steps
          (graph.graph.stepFilter.length === 0 || graph.graph.stepFilter.indexOf(item.step_name) > -1) &&
          // Filter out steps starting with _ since they are not interesting to user
          !item.step_name.startsWith('_'),
      );

    // Make list of rows. Note that in list steps and tasks are equal rows, they are just rendered a bit differently
    const newRows: Row[] = makeVisibleRows(rows, graph.graph, visibleSteps, searchField.results);

    if (visibleSteps.length > 0) {
      // Find last point in timeline. We could do this somewhere else.. Like in useRowData reducer
      const highestTimestamp = findHighestTimestampForGraph(rows, graph.graph, visibleSteps);

      graph.dispatch({ type: 'init', start: visibleSteps[0].ts_epoch, end: highestTimestamp });
    }

    const rowsToUpdate = !graph.graph.group ? newRows.sort(sortRows(graph.graph.sortBy, graph.graph.sortDir)) : newRows;

    // If no grouping, sort tasks here.
    setVisibleRows(rowsToUpdate);
    /* eslint-disable */
  }, [
    rows,
    graph.graph.stepFilter,
    graph.graph.min,
    graph.graph.sortBy,
    graph.graph.sortDir,
    graph.graph.statusFilter,
    graph.graph.group,
    searchField.results,
  ]);

  return (
    <>
      <RunHeader run={run} parameters={runParameters} status={runParametersStatus} error={runParameterError} />
      <Tabs
        widen
        activeTab={tab}
        tabs={[
          {
            key: 'dag',
            label: t('run.DAG'),
            linkTo: getPath.dag(params.flowId, params.runNumber) + '?' + urlParams,
            component: <DAG run={run} steps={steps} />,
          },
          {
            key: 'timeline',
            label: t('run.timeline'),
            linkTo: getPath.timeline(params.flowId, params.runNumber) + '?' + urlParams,
            component: (
              <Timeline
                rows={visibleRows}
                steps={steps}
                rowDataDispatch={dispatch}
                status={taskStatus}
                counts={counts}
                graph={graph}
                searchField={searchField}
                paramsString={urlParams}
                isAnyGroupOpen={isAnyGroupOpen}
              />
            ),
          },
          {
            key: 'task',
            label: previousTaskId ? `${t('items.task')}: ${previousTaskId}` : `${t('items.task')}`,
            linkTo:
              (previousStepName &&
                previousTaskId &&
                getPath.task(params.flowId, params.runNumber, previousStepName, previousTaskId) + '?' + urlParams) ||
              getPath.tasks(params.flowId, params.runNumber) + '?' + urlParams,
            temporary: !!(previousStepName && previousTaskId),
            component: (
              <TaskViewContainer
                run={run}
                stepName={previousStepName || 'not-selected'}
                taskId={previousTaskId || 'not-selected'}
                rows={visibleRows}
                rowDataDispatch={dispatch}
                searchField={searchField}
                graph={graph}
                counts={counts}
                paramsString={urlParams}
                isAnyGroupOpen={isAnyGroupOpen}
              />
            ),
          },
        ]}
      />
    </>
  );
};

function cleanParametersMap(params: any) {
  return Object.keys(params).reduce((obj, key) => {
    if (params[key]) {
      return { ...obj, [key]: params[key] };
    }
    return obj;
  }, {});
}

export default RunContainer;
