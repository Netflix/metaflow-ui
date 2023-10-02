import React from 'react';
import styled from 'styled-components';
import { Run } from '../../../types';
import { getRunEndTime } from '../../../utils/run';
import { TDWithLink } from './ResultGroupCells';

type Props = {
  run: Run;
  link: string;
  timezone: string;
};

/**
 * Displays "Finished At" cell in table of runs
 * @param run The run to display
 * @param link The link to the run page
 * @param timezone The timezone to display the time in
 */
const FinishedAtCell: React.FC<Props> = ({ run, link, timezone }) => {
  const displayTime = getRunEndTime(run, timezone);
  const [date, time] = displayTime ? displayTime.split(' ') : [null, null];

  return (
    <TDWithLink link={link}>
      <DisplayDate>{date}</DisplayDate>
      <DisplayTime>{time}</DisplayTime>
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

export default FinishedAtCell;
