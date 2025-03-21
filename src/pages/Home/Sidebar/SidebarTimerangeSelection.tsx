import { TFunction } from 'i18next';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TimeRange from '@components/Form/TimeRange';
import Icon from '@components/Icon';
import { TimezoneContext } from '@components/TimezoneProvider';
import { getTimeFromPastByDays, getTimeRangeString } from '@utils/date';
import { SidebarSectionWrapper } from '.';
import { ParameterList, StyledRemovableTag } from './SidebarTags';

//
// Typedef
//

type Props = {
  // Update queryparameter
  updateField: (key: string, value: string) => void;
  params: Record<string, string>;
};

const SidebarTimerangeSelection: React.FC<Props> = ({ params, updateField }) => {
  const { timezone } = useContext(TimezoneContext);
  const startTime = params.timerange_start;
  const endTime = params.timerange_end;
  const hasSelectedTimeRange = startTime || endTime;
  const { t } = useTranslation();

  const shouldShowWarning = !hasSelectedTimeRange && !params.flow_id && !params._tags && !params.user;

  const handleSubmit = ({ start, end }: { start: number | null; end: number | null }) => {
    updateField('timerange_start', start ? start.toString() : '');
    updateField('timerange_end', end ? end.toString() : '');
  };

  const initialValues: [number | null, number | null] = useMemo(
    () => [startTime ? parseInt(startTime) : null, endTime ? parseInt(endTime) : null],
    [startTime, endTime],
  );

  return (
    <SidebarSectionWrapper>
      <TimeRange initialValues={initialValues} onSubmit={handleSubmit} sectionLabel="Time frame" />

      {hasSelectedTimeRange && (
        <ParameterList>
          <StyledRemovableTag
            title={getRawDateString(startTime, endTime, timezone)}
            onClick={() => {
              updateField('timerange_start', '');
              updateField('timerange_end', '');
            }}
          >
            {formatString(startTime, endTime, timezone, t)}
          </StyledRemovableTag>
        </ParameterList>
      )}

      {shouldShowWarning && (
        <SidebarWarning>
          <Icon name="warningThick" size="md" />
          <span>{t('home.no-timeframe-warning')}</span>
        </SidebarWarning>
      )}
    </SidebarSectionWrapper>
  );
};

//
// Utils
//

function formatString(start: string | undefined, end: string | undefined, timezone: string, t: TFunction): string {
  // Check if selected time is last 30d, last 14d or today
  if (start && !end) {
    if (parseInt(start) === getTimeFromPastByDays(30, timezone)) {
      return t('date.month');
    } else if (parseInt(start) === getTimeFromPastByDays(14, timezone)) {
      return t('date.twoweeks');
    } else if (parseInt(start) === getTimeFromPastByDays(0, timezone)) {
      return t('date.today');
    }
  }
  // Check if yesterday preset was selected
  if (
    start &&
    end &&
    parseInt(start) === getTimeFromPastByDays(1, timezone) &&
    parseInt(end) === getTimeFromPastByDays(0, timezone)
  ) {
    return t('date.yesterday');
  }

  return getRawDateString(start, end, timezone);
}

function getRawDateString(start: string | undefined, end: string | undefined, timezone: string): string {
  return `${start ? getTimeRangeString(new Date(parseInt(start)), timezone) : ''} - ${
    end ? getTimeRangeString(new Date(parseInt(end)), timezone) : ''
  }`;
}

//
// Style
//

const SidebarWarning = styled.div`
  display: flex;
  padding-top: 1rem;

  i {
    padding: 0 0.5rem;
  }

  span {
    font-size: 0.675rem;
  }
`;

export default SidebarTimerangeSelection;
