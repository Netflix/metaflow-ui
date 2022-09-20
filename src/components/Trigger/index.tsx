import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

const MAX_LABEL_WIDTH = 20; // number of characters to show before truncating

export type TriggerEventsValue = {
  flow_name: string;
  run_id?: string;
  event_id: string;
  event_name: string;
  timestamp: number;
};

//
// Typedef
//

type Props = {
  triggerEventsValue: TriggerEventsValue;
  className?: string;
};

/**
 * Displays a single trigger event with a link to the flow run that triggered this flow run.
 * @param triggerEventsValue The trigger event to display.
 * @param className Enables styling of the component.
 */
const Trigger: React.FC<Props> = ({ triggerEventsValue, className }) => {
  const { flow_name, run_id, event_id } = triggerEventsValue;

  // Only handles triggers from runs
  const label = `${flow_name}/${run_id}`;
  const link = `/${flow_name}/${run_id}`;
  const linkToRun = Boolean(run_id);
  let displayLabel = label;

  // Truncate the label in the middle to fit to about MAX_LABEL_WIDTH characters.
  if (label.length > MAX_LABEL_WIDTH) {
    displayLabel = label.slice(0, MAX_LABEL_WIDTH / 2) + '...' + label.slice((-1 * MAX_LABEL_WIDTH) / 2);
  }
  const tooltipId = `label-tooltip-${event_id}`;
  return (
    <TriggerLine key={event_id} data-tip data-for={tooltipId} className={className}>
      <StyledIcon name="arrow" linkToRun={linkToRun} />
      <TriggerLink href={link}>{displayLabel}</TriggerLink>
      <Tooltip id={tooltipId}>{label}</Tooltip>
    </TriggerLine>
  );
};

type ArrowIconProps = {
  linkToRun: boolean;
};

const TriggerLine = styled.div`
  color: #fff;
  margin-top: 4px;
  white-space: nowrap;
`;

const TriggerLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.color.text.light};
`;

const StyledIcon = styled(Icon)<ArrowIconProps>`
  margin-right: 4px;
  circle {
    fill: ${(props) => (props.linkToRun ? '#336cde' : '#54ac43')};
  }
  path {
    fill: #fff;
  }
`;

export default Trigger;
