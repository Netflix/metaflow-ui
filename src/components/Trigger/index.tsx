import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

const MAX_LABEL_WIDTH = 20; // number of characters to show before truncating

export type TriggerEventsValue = {
  id: string;
  name: string;
  type: 'run' | 'event';
  timestamp: string;
};

//
// Typedef
//

type Props = {
  triggerEventsValue: TriggerEventsValue;
  className?: string;
  showToolTip?: boolean;
};

/**
 * Displays a single trigger event with a link to the flow run that triggered this flow run.
 * @param triggerEventsValue The trigger event to display.
 * @param className Enables styling of the component.
 */
const Trigger: React.FC<Props> = ({ triggerEventsValue, className, showToolTip = true }) => {
  const { id, type, name } = triggerEventsValue;

  // Only handles triggers from runs
  const label = type === 'run' ? id.split('/').slice(0, 2).join('/') : name;
  const link = type === 'run' ? '/' + label : undefined;
  const linkToRun = Boolean(link);
  let displayLabel = label;

  // Truncate the label in the middle to fit to about MAX_LABEL_WIDTH characters.
  if (label.length > MAX_LABEL_WIDTH) {
    displayLabel = label.slice(0, MAX_LABEL_WIDTH / 2) + '...' + label.slice((-1 * MAX_LABEL_WIDTH) / 2);
  }
  const tooltipId = `label-tooltip-${id}`;

  return (
    <TriggerLine key={id} data-tip data-for={tooltipId} className={className}>
      <TriggerLink href={link}>
        <StyledIcon name="arrow" linkToRun={linkToRun} />
        {showToolTip ? displayLabel : id}
      </TriggerLink>
      {showToolTip && <Tooltip id={tooltipId}>{label}</Tooltip>}
    </TriggerLine>
  );
};

type ArrowIconProps = {
  linkToRun: boolean;
};

const TriggerLine = styled.div`
  margin-top: 4px;
  white-space: nowrap;
  position: relative;
`;

const TriggerLink = styled.a`
  text-decoration: none;
  color: inherit;
`;

const StyledIcon = styled(Icon)<ArrowIconProps>`
  margin-right: 4px;
  circle {
    fill: ${(props) => (props.linkToRun ? '#336cde' : '#54ac43')};
  }
  svg path {
    fill: #fff;
  }
`;

export default Trigger;
