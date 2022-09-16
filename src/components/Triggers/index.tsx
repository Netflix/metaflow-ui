import React from 'react';
import { Run } from '../../types';
import Trigger, { TriggerEventsValue } from '../Trigger';

type Props = {
  run: Run;
};

const Triggers: React.FC<Props> = () => {
  return (
    <>
      {getTriggers().map((triggerEventsValue: TriggerEventsValue) => (
        <Trigger triggerEventsValue={triggerEventsValue} key={triggerEventsValue.event_id} />
      ))}
    </>
  );
};

const getTriggers = () => {
  const mockValue =
    '[{"event_name": "metaflow_flow_run_succeeded", "timestamp": 1663184739, "event_id": "123456789123", "flow_name": "HelloFlow", "run_id": "argo-helloflow-atykf"}]';
  return JSON.parse(mockValue);
};

export default Triggers;
