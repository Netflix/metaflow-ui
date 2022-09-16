import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

const MAX_LABEL_WIDTH = 20;

export type TriggerEventsValue = {
  flow_name: string;
  run_id?: string;
  event_id: string;
  event_name: string;
  timestamp: number;
};

type Props = {
  triggerEventsValue: TriggerEventsValue;
  className?: string;
};

const Trigger: React.FC<Props> = ({ triggerEventsValue, className }) => {
  const { flow_name, run_id, event_id } = triggerEventsValue;
  const label = `${flow_name}/${run_id}`;
  const link = `/${flow_name}/${run_id}`;
  const linkToRun = !!run_id;
  let displayLabel = label;
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
