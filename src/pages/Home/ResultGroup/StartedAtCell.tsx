import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Triggers from '../../../components/Triggers';
import useResource from '../../../hooks/useResource';
import { Metadata, Run } from '../../../types';
import { metadataToRecord } from '../../../utils/metadata';
import { getRunStartTime } from '../../../utils/run';
import { TDWithLink } from './ResultGroupCells';

const emptyArray: Metadata[] = [];
const initialQueryParams = {
  step_name: 'start',
};

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
    setMetadataRecord((old) => ({ ...old, ...metadataRecord }));
  }, []);

  useResource<Metadata[], Metadata>({
    url: `/flows/${run.flow_id}/runs/${run.run_number}/metadata`,
    initialData: emptyArray,
    subscribeToEvents: true,
    queryParams: initialQueryParams,
    onUpdate,
    fetchAllData: true,
  });

  const triggerEventsValue = JSON.parse(metadataRecord?.['execution-triggers'] ?? '[]');
  const hasTrigger = Boolean(triggerEventsValue);
  const displayTime = getRunStartTime(run, timezone);
  const [date, time] = displayTime ? displayTime.split(' ') : [null, null];

  return (
    <TDWithLink link={hasTrigger ? undefined : link}>
      <StartedAtWrapper>
        <DisplayDate>{date}</DisplayDate>
        <DisplayTime>{time}</DisplayTime>
        {hasTrigger ? <Triggers showMultiple triggerEventsValue={triggerEventsValue} /> : null}
      </StartedAtWrapper>
    </TDWithLink>
  );
};

const DisplayDate = styled.div`
  word-break: break-word;
`;

const DisplayTime = styled.div`
  color: ${(p) => p.theme.color.text.light};
  word-break: break-word;
`;

const StartedAtWrapper = styled.div`
  display: inline-block;
`;

export default StartedAtCell;
