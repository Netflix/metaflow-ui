import React, { useCallback, useState } from 'react';
import { Metadata, Run } from '@/types';
import { TDWithLink } from '@pages/Home/ResultGroup/Cells';
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
  link: string;
};

const TriggeredByCell: React.FC<Props> = ({ run, link }) => {
  const [metadataRecord, setMetadataRecord] = useState<Record<string, string>>();

  const onUpdate = useCallback((items: Metadata[]) => {
    const metadataRecord = metadataToRecord(items);
    console.log(metadataRecord);
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
    <TDWithLink link={hasTrigger ? undefined : link}>
      {status !== 'Loading' && (
        <TriggeredByBadge
          id={run.run_number}
          content={
            hasTrigger ? { type: 'trigger', data: triggerEventsValue } : { type: 'user', data: getUsername(run) }
          }
        />
      )}
    </TDWithLink>
  );
};

export default TriggeredByCell;
