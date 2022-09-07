import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useRowData from '../../components/Timeline/useTaskData';
import { getPath } from '../../utils/routing';
import { Metadata, Run as IRun } from '../../types';

import TaskViewContainer from '../Task';
import { APIErrorRenderer } from '../../components/GenericError';
import Tabs from '../../components/Tabs';
import RunHeader from './RunHeader';
import DAG from '../../components/DAG';
import Timeline, { Row } from '../../components/Timeline/VirtualizedTimeline';
import useSearchField from '../../hooks/useSearchField';
import ErrorBoundary from '../../components/GeneralErrorBoundary';
import { logWarning } from '../../utils/errorlogger';

import FEATURE from '../../utils/FEATURE';
import { RunPageParams } from '.';
import { cleanParametersMap, getTaskFromList, getTaskPageLink, makeVisibleRows, sortRows } from './Run.utils';
import styled from 'styled-components';
import { FixedContent } from '../../components/Structure';
import useTaskListSettings from '../../components/Timeline/useTaskListSettings';
import useResource from '../../hooks/useResource';
import { PluginsContext } from '../../components/Plugins/PluginManager';
import { metadataToRecord } from '../../utils/metadata';
import { GraphModel } from '../../components/DAG/DAGUtils';
import { getRunId } from '../../utils/run';

//
// Typedef
//

type RunPageProps = {
  run: IRun;
  params: RunPageParams;
};

const emptyArray: Metadata[] = [];
const DAG_RETRY_TIMEOUT = 3000; // time between retries when fetching the DAG

//
// Component
//

const RunPage: React.FC<RunPageProps> = ({ run, params }) => {
  const { t } = useTranslation();
  const { addDataToStore, clearDataStore } = useContext(PluginsContext);

  // Store active tab. Is defined by URL
  const [tab, setTab] = useState(params.viewType ? params.viewType : 'timeline');
  useEffect(() => {
    if (params.viewType) {
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
    getRunId(run),
  );

  //
  // Metadata for plugins
  //

  const onUpdate = useCallback(
    (items: Metadata[]) => {
      addDataToStore('run-metadata', metadataToRecord(items));
    },
    [addDataToStore],
  );

  useEffect(() => {
    return () => clearDataStore('run-metadata');
  });

  useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${getRunId(run)}/metadata`,
    initialData: emptyArray,
    subscribeToEvents: true,
    queryParams: {
      step_name: 'start',
    },
    onUpdate,
  });

  //
  // Search API
  //

  const searchField = useSearchField(run.flow_id, getRunId(run));

  //
  // Listing settings and graph measurements
  //

  const { settings, params: listParams, setQueryParam, setMode } = useTaskListSettings();

  const urlParams = new URLSearchParams(cleanParametersMap(listParams)).toString();

  useEffect(() => {
    setPreviousStepName(params.stepName || undefined);
    setPreviousTaskId(params.taskId || undefined);
    // If there is no previous settings, lets default to some of modes.
    if (!listParams.direction && !listParams.order && !listParams.status) {
      if (run.status === 'completed') {
        setMode('overview');
      } else if (run.status === 'running') {
        setMode('monitoring');
      } else if (run.status === 'failed') {
        setMode('error-tracker');
      }
    }
  }, [
    params.runNumber,
    listParams.direction,
    listParams.order,
    listParams.status,
    params.stepName,
    params.taskId,
    run.status,
    setMode,
  ]);

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
          (settings.stepFilter.length === 0 || settings.stepFilter.indexOf(step_name) > -1) &&
          // Filter out steps starting with _ since they are not interesting to user
          !step_name.startsWith('_'),
      );

      // Make list of rows. Note that in list steps and tasks are equal rows, they are just rendered a bit differently
      const newRows: Row[] = makeVisibleRows(rows, settings, visibleSteps, searchField.results);
      // If no grouping, sort tasks here.
      const rowsToUpdate = !settings.group ? newRows.sort(sortRows(settings.sort[0], settings.sort[1])) : newRows;
      if (
        !(visibleRows.length === 0 && rowsToUpdate.length === 0) &&
        JSON.stringify(visibleRows) !== JSON.stringify(rowsToUpdate)
      ) {
        setVisibleRows(rowsToUpdate);
      }
    } catch (e) {
      logWarning('Unexpected error while contructing task rows: ', e);
    }
  }, [
    rows,
    settings.stepFilter,
    settings.sort,
    settings.statusFilter,
    settings.group,
    searchField.results,
    settings,
    visibleRows,
  ]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 1);
  }, []);

  const sharedProps = {
    run,
    rows: visibleRows,
    rowDataDispatch: dispatch,
    taskStatus,
    counts: counts,
    searchField,
    settings,
    paramsString: urlParams,
    isAnyGroupOpen,
    setQueryParam,
    onModeSelect: setMode,
  };

  //
  // DAG data, fetch here to prevent multiple fetches when switching tabs
  //
  const dagResult = useResource<GraphModel, GraphModel>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${getRunId(run)}/dag`),
    subscribeToEvents: false,
    initialData: null,
  });
  // Refetch dag on tab change if dag fetching failed
  useEffect(() => {
    if ((dagResult.status === 'Error' || dagResult.data === null) && tab === 'dag') {
      setTimeout(() => dagResult.retry(), DAG_RETRY_TIMEOUT);
    }
  }, [tab, dagResult]);

  return (
    <>
      <RunPageContainer visible={visible}>
        <ErrorBoundary message={t('error.run-header-error')}>
          <RunHeader run={run} />
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
                        <DAG run={run} steps={steps} result={dagResult} />
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
                    <Timeline {...sharedProps} />
                  )}
                </ErrorBoundary>
              ),
            },
            {
              key: 'task',
              label: previousTaskId ? `${t('items.task')}: ${previousTaskId}` : `${t('items.task')}`,
              linkTo: getTaskPageLink(
                params.flowId,
                params.runNumber,
                previousStepName,
                previousTaskId,
                urlParams,
                rows,
              ),
              component: (
                <ErrorBoundary message={t('error.task-error')}>
                  {taskError || stepError ? (
                    <APIErrorRenderer error={taskError || stepError} />
                  ) : (
                    <TaskViewContainer
                      {...sharedProps}
                      taskFromList={getTaskFromList(rows, params.stepName, params.taskId)}
                      stepName={previousStepName || 'not-selected'}
                      taskId={previousTaskId || 'not-selected'}
                      dagResult={dagResult}
                    />
                  )}
                </ErrorBoundary>
              ),
            },
          ]}
        />
      </RunPageContainer>
    </>
  );
};

const RunPageContainer = styled(FixedContent)<{ visible: boolean }>`
  transition: 0.5s opacity;
  opacity: ${(p) => (p.visible ? '1' : '0')};
  height: calc(100vh - 9rem);
`;

export default RunPage;
