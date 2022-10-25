import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

const MAX_LABEL_WIDTH = 20; // number of characters to show before truncating

export type TriggerEventsValue = {
  flow_name: string;
  run_id?: string;
  event_name: string;
  event_type: 'metaflow_user' | 'metaflow_service';
  timestamp: number;
  pathspec: string;
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
  const { pathspec } = triggerEventsValue;

  // Only handles triggers from runs
  const label = pathspec;
  const link = pathspec;
  const id = pathspec;
  const linkToRun = Boolean(link);
  let displayLabel = label;

  // Truncate the label in the middle to fit to about MAX_LABEL_WIDTH characters.
  if (label.length > MAX_LABEL_WIDTH) {
    displayLabel = label.slice(0, MAX_LABEL_WIDTH / 2) + '...' + label.slice((-1 * MAX_LABEL_WIDTH) / 2);
  }
  const tooltipId = `label-tooltip-${id}`;
  return (
    <TriggerLine key={id} data-tip data-for={tooltipId} className={className}>
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
