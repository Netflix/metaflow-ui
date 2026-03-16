import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Metadata, AsyncStatus, Run } from '@/types';
import { GraphModel } from '@components/DAG/DAGUtils';
import DAGContent from '@components/DAG/components/DAGContent';
import DAGControlBar from '@components/DAG/components/DAGControlBar';
import DAGError from '@components/DAG/components/DAGError';
import FullPageContainer from '@components/FullPageContainer';
import Spinner from '@components/Spinner';
import { ItemRow } from '@components/Structure';
import { StepLineData } from '@components/Timeline/taskdataUtils';
import { RowDataModel } from '@components/Timeline/useTaskData';
import { Resource } from '@hooks/useResource';

//
// DAG
//

const DAG: React.FC<{
  run: Run;
  steps: StepLineData[];
  rows: RowDataModel;
  metadata: Metadata[];
  result: Resource<GraphModel>;
}> = ({ run, steps, rows, metadata, result }) => {
  const { t } = useTranslation();
  const [showFullscreen, setFullscreen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const graphData = result.data;

  const content = !!graphData && (
    <DAGContent
      graphData={graphData}
      showFullscreen={showFullscreen}
      stepData={steps}
      run={run}
      tasks={rows}
      metadata={metadata}
      isExpanded={isExpanded}
    />
  );

  return (
    <div style={{ width: '100%' }}>
      {isDAGError(result.status, graphData) ? (
        <DAGError error={result.error} t={t} run={run} />
      ) : (
        <DAGControlBar setFullscreen={setFullscreen} isExpanded={isExpanded} setExpanded={setExpanded} t={t} />
      )}
      {result.status === 'Loading' && (
        <ItemRow justify="center">
          <Spinner md />
        </ItemRow>
      )}
      {showFullscreen ? <FullPageContainer onClose={() => setFullscreen(false)}>{content}</FullPageContainer> : content}
    </div>
  );
};

//
// Is considered as error
//

export function isDAGError(status: AsyncStatus, graph: GraphModel | null): boolean {
  return (status === 'Ok' || status === 'Error') && !graph;
}

export default DAG;
