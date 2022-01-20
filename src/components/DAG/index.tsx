import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GraphModel } from './DAGUtils';
import { AsyncStatus, Run } from '../../types';
import { ItemRow } from '../Structure';
import { Resource } from '../../hooks/useResource';
import FullPageContainer from '../FullPageContainer';
import Spinner from '../Spinner';
import DAGContent from './components/DAGContent';
import DAGError from './components/DAGError';
import DAGControlBar from './components/DAGControlBar';
import { StepLineData } from '../Timeline/taskdataUtils';

//
// DAG
//

const DAG: React.FC<{ run: Run; steps: StepLineData[]; result: Resource<GraphModel> }> = ({ run, steps, result }) => {
  const { t } = useTranslation();
  const [showFullscreen, setFullscreen] = useState(false);
  const graphData = result.data;

  const content = !!graphData && (
    <DAGContent graphData={graphData} showFullscreen={showFullscreen} stepData={steps} run={run} />
  );

  return (
    <div style={{ width: '100%' }}>
      {isDAGError(result.status, graphData) ? (
        <DAGError error={result.error} t={t} run={run} />
      ) : (
        <DAGControlBar setFullscreen={setFullscreen} t={t} />
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
