import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Triggers from '../../../components/Triggers';
import useResource from '../../../hooks/useResource';
import { Metadata, Run } from '../../../types';
import { metadataToRecord } from '../../../utils/metadata';
import { getRunId, getRunStartTime } from '../../../utils/run';
import { TDWithLink } from './ResultGroupCells';

const emptyArray: Metadata[] = [];

type Props = {
  run: Run;
  link: string;
  timezone: string;
};

/**
 * Displays "Started At" cell in table of runs
 * @param run The run to display
 * @param link The link to the run page
 * @param timezone The timezone to display the time in
 */
const StartedAtCell: React.FC<Props> = ({ run, link, timezone }) => {
  const [metadataRecord, setMetadataRecord] = useState<Record<string, string>>();

  const onUpdate = useCallback((items: Metadata[]) => {
    const metadataRecord = metadataToRecord(items);
    setMetadataRecord(metadataRecord);
  }, []);

  useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${getRunId(run)}/metadata`,
    initialData: emptyArray,
    subscribeToEvents: true,
    queryParams: {
      step_name: 'start',
    },
    onUpdate,
  });

  const hasTrigger = Boolean(metadataRecord?.['trigger_events']);

  return (
    <TDWithLink link={hasTrigger ? undefined : link}>
      <WordBreak>{getRunStartTime(run, timezone)}</WordBreak>
      {hasTrigger ? (
        <Triggers showMultiple triggerEventsValue={JSON.parse(metadataRecord?.['trigger_events'] ?? '')} />
      ) : null}
    </TDWithLink>
  );
};

const WordBreak = styled.span`
  word-break: break-word;
`;

export default StartedAtCell;
