import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DAGModel, convertDAGModelToTree, DAGStructureTree } from './DAGUtils';
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

const DAG: React.FC<{ run: Run; steps: StepLineData[]; result: Resource<DAGModel> }> = ({ run, steps, result }) => {
  const { t } = useTranslation();
  const [showFullscreen, setFullscreen] = useState(false);
  const dagTree = result.data ? convertDAGModelToTree(result.data) : [];

  const content = !!dagTree.length && (
    <DAGContent dagTree={dagTree} showFullscreen={showFullscreen} stepData={steps} run={run} />
  );

  return (
    <div style={{ width: '100%' }}>
      {isDAGError(result.status, dagTree) ? (
        <DAGError error={result.error} t={t} />
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

export function isDAGError(status: AsyncStatus, dagTree: DAGStructureTree): boolean {
  return (status === 'Ok' || status === 'Error') && !dagTree.length;
}

export default DAG;
