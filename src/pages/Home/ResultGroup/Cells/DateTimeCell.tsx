import React, { useContext } from 'react';
import styled from 'styled-components';
import { TDWithLink } from '@/pages/Home/ResultGroup/Cells';
import { TimezoneContext } from '@components/TimezoneProvider';
import { getCalendarDateTimeString } from '@utils/date';

type Props = {
  date: Date | null;
  link: string;
};

const DateTimeCell: React.FC<Props> = ({ date, link }) => {
  const { timezone } = useContext(TimezoneContext);
  const dateString = date ? getCalendarDateTimeString(date, timezone) : null;

  return (
    <TDWithLink link={link}>
      <RightAligned>{dateString}</RightAligned>
    </TDWithLink>
  );
};

const RightAligned = styled.div`
  text-align: right;
  white-space: nowrap;
`;

export default DateTimeCell;
