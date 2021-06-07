import React, { useContext } from 'react';
import { SidebarSectionWrapper } from '.';
import TimeRange from '../../../components/Form/TimeRange';
import { ParameterList, StyledRemovableTag } from './SidebarTags';
import { TimezoneContext } from '../../../components/TimezoneProvider';
import { getTimeRangeString } from '../../../utils/date';

//
// Typedef
//

type Props = {
  // Update queryparameter
  updateField: (key: string, value: string) => void;
  startTime?: string;
  endTime?: string;
};

const SidebarTimerangeSelection: React.FC<Props> = ({ startTime, endTime, updateField }) => {
  const { timezone } = useContext(TimezoneContext);
  const hasSelectedTimeRange = startTime || endTime;

  return (
    <SidebarSectionWrapper>
      <TimeRange
        initialValues={[startTime ? parseInt(startTime) : null, endTime ? parseInt(endTime) : null]}
        onSubmit={({ start, end }) => {
          updateField('timerange_start', start ? start.toString() : '');
          updateField('timerange_end', end ? end.toString() : '');
        }}
        sectionLabel="Time frame"
      />

      {hasSelectedTimeRange && (
        <ParameterList>
          <StyledRemovableTag
            onClick={() => {
              updateField('timerange_start', '');
              updateField('timerange_end', '');
            }}
          >
            {`${startTime ? getTimeRangeString(new Date(parseInt(startTime)), timezone) : ''} - ${
              endTime ? getTimeRangeString(new Date(parseInt(endTime)), timezone) : ''
            }`}
          </StyledRemovableTag>
        </ParameterList>
      )}
    </SidebarSectionWrapper>
  );
};

export default SidebarTimerangeSelection;
