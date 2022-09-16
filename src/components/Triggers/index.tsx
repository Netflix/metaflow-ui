import React from 'react';
import Icon from '../Icon';
import { Run } from '../../types';
import styled from 'styled-components';
import Tooltip from '../Tooltip';

const MAX_LABEL_WIDTH = 20;

type Props = {
  run: Run;
};

type Trigger = {
  link: string;
  label: string;
  displayLabel: string;
  type: 'run' | 'other';
  event_id: string;
};

const Triggers: React.FC<Props> = ({ run }) => (
  <>
    {getTriggers(run).map((trigger) => {
      const tooltipId = `label-tooltip-${trigger.event_id}`;
      return (
        <TriggerLine key={trigger.label} title={trigger.label} data-tip data-for={tooltipId}>
          <StyledIcon name="arrow" linkToRun={trigger.type === 'run'} />
          <Trigger href={trigger.link}>{trigger.displayLabel}</Trigger>
          <Tooltip id={tooltipId}>{trigger.label}</Tooltip>
        </TriggerLine>
      );
    })}
  </>
);

const getTriggers = (run: Run): Trigger[] => {
  const event_id = '2d3d23e1e1e';
  const run_id = '1234';
  const flow_name = 'MyReallyLongFlow';
  const label = `${flow_name}/${run_id}`;
  let displayLabel = label;
  if (label.length > MAX_LABEL_WIDTH) {
    displayLabel = label.slice(0, MAX_LABEL_WIDTH / 2) + '...' + label.slice((-1 * MAX_LABEL_WIDTH) / 2);
  }
  return [{ link: 'http://bbc.co.uk', label, displayLabel: 'By ' + displayLabel, type: 'run', event_id }];
};

type ArrowIconProps = {
  linkToRun: boolean;
};

const TriggerLine = styled.div`
  color: #fff;
  margin-top: 4px;
`;

const Trigger = styled.a`
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
export default Triggers;
