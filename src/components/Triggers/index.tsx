import React, { MouseEventHandler, useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import Popover from '../Popover';
import Trigger, { TriggerEventsValue } from '../Trigger';

type Props = {
  triggerEventsValue?: TriggerEventsValue[];
  showMultiple?: boolean;
};

/**
 * Show (potentially) multiple triggers for this flow run.
 * @param triggerEventsValue The trigger event to display.
 */
const Triggers: React.FC<Props> = ({ triggerEventsValue, showMultiple = false }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleTriggerClick: MouseEventHandler = () => setPopoverOpen((open) => !open);

  if (!triggerEventsValue) return null;

  return showMultiple || triggerEventsValue.length < 2 ? (
    <TriggerWrapper>
      {triggerEventsValue?.map((triggerEventsValue: TriggerEventsValue) => (
        <Trigger triggerEventsValue={triggerEventsValue} key={triggerEventsValue.id ?? triggerEventsValue.name} />
      ))}
    </TriggerWrapper>
  ) : (
    <div>
      <TriggersButton onClick={handleTriggerClick}>
        <StyledIcon name="arrow" />
        {triggerEventsValue.length} triggers
      </TriggersButton>
      <PopoverWrapper open={popoverOpen}>
        <Popover show>
          {triggerEventsValue?.map((triggerEventsValue: TriggerEventsValue) => (
            <Trigger
              triggerEventsValue={triggerEventsValue}
              key={triggerEventsValue.id ?? triggerEventsValue.name}
              showToolTip={false}
            />
          ))}
        </Popover>
      </PopoverWrapper>
    </div>
  );
};

const PopoverWrapper = styled.div<{ open: boolean }>`
  position: relative;
  visibility: ${(props) => (props.open ? 'visible' : 'hidden')};
  color: ${(props) => props.theme.color.text.light};
`;

const StyledIcon = styled(Icon)`
  margin-right: 4px;
  circle {
    fill: #336cde;
  }
  path {
    fill: #fff;
  }
`;

const TriggersButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  padding: 0;
  cursor: pointer;
`;

const TriggerWrapper = styled.div`
  color: inherit;
`;

export default Triggers;
