import React from 'react';
import Trigger, { TriggerEventsValue } from '../Trigger';

type Props = {
  triggerEventsValue?: TriggerEventsValue[];
};

/**
 * Show (potentially) multiple triggers for this flow run.
 * @param triggerEventsValue The trigger event to display.
 */
const Triggers: React.FC<Props> = ({ triggerEventsValue }) => {
  return (
    <>
      {triggerEventsValue?.map((triggerEventsValue: TriggerEventsValue) => (
        <Trigger triggerEventsValue={triggerEventsValue} key={triggerEventsValue.event_id} />
      ))}
    </>
  );
};

export default Triggers;
