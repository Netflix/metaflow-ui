import React, { useCallback, useState } from 'react';
import { Metadata, Run } from '@/types';
import { TD } from '@components/Table';
import TriggeredByBadge from '@components/Trigger/TriggeredByBadge';
import useResource from '@hooks/useResource';
import { metadataToRecord } from '@utils/metadata';
import { getUsername } from '@utils/run';

const emptyArray: Metadata[] = [];
const initialQueryParams = {
  step_name: 'start',
};

type Props = {
  run: Run;
};

const TriggeredByCell: React.FC<Props> = ({ run }) => {
  const [metadataRecord, setMetadataRecord] = useState<Record<string, string>>();

  const onUpdate = useCallback((items: Metadata[]) => {
    const metadataRecord = metadataToRecord(items);
    setMetadataRecord((old) => ({ ...old, ...metadataRecord }));
  }, []);

  const { status } = useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/metadata`,
    initialData: emptyArray,
    subscribeToEvents: true,
    queryParams: initialQueryParams,
    onUpdate,
    fetchAllData: true,
  });

  const triggerEventsValue = JSON.parse(metadataRecord?.['execution-triggers'] ?? '[]');
  const hasTrigger = triggerEventsValue?.length > 0;

  return (
    <TD>
      {status !== 'Loading' && (
        <TriggeredByBadge
          content={
            hasTrigger ? { type: 'trigger', data: triggerEventsValue } : { type: 'user', data: getUsername(run) }
          }
        />
      )}
    </TD>
  );
};

export default TriggeredByCell;
