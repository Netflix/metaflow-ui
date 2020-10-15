import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DAGModel, convertDAGModelToTree, DAGStructureTree } from './DAGUtils';
import { AsyncStatus, Run, Step } from '../../types';
import { ItemRow } from '../Structure';
import useResource from '../../hooks/useResource';
import FullPageContainer from '../FullPageContainer';
import Spinner from '../Spinner';
import DAGContent from './components/DAGContent';
import DAGError from './components/DAGError';
import DAGControlBar from './components/DAGControlBar';

//
// DAG
//

const DAG: React.FC<{ run: Run }> = ({ run }) => {
  const { t } = useTranslation();
  const [showFullscreen, setFullscreen] = useState(false);
  const [dagTree, setDagTree] = useState<DAGStructureTree>([]);

  const { data: stepData } = useResource<Step[], Step>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/steps`),
    subscribeToEvents: true,
    initialData: [],
    queryParams: {
      _order: '+ts_epoch',
      _limit: '1000',
    },
  });

  const { status, error } = useResource<DAGModel, DAGModel>({
    url: encodeURI(`/flows/${run.flow_id}/runs/${run.run_number}/dag`),
    subscribeToEvents: false,
    initialData: null,
    onUpdate: (data) => {
      setDagTree(convertDAGModelToTree(data));
    },
  });

  const content = !!dagTree.length && (
    <DAGContent dagTree={dagTree} showFullscreen={showFullscreen} stepData={stepData} run={run} />
  );

  return (
    <div style={{ width: '100%' }}>
      {isDAGError(status, dagTree) ? (
        <DAGError error={error} t={t} />
      ) : (
        <DAGControlBar setFullscreen={setFullscreen} t={t} />
      )}
      {status === 'Loading' && (
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

function isDAGError(status: AsyncStatus, dagTree: DAGStructureTree) {
  return (status === 'Ok' || status === 'Error') && !dagTree.length;
}

export default DAG;
