import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { SelectField } from '../Form';
import { TimezoneContext, TIMEZONES } from '../TimezoneProvider';
import Toggle from '../Toggle';

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const [expanded, setExpanded] = useState(timezone !== '+00:00' ? true : false);

  return (
    <div>
      <TimezoneRow>
        <div>Use timezone</div>
        <Toggle
          value={expanded}
          onClick={() => {
            if (expanded) {
              updateTimezone('+00:00');
            }
            setExpanded(!expanded);
          }}
        />
      </TimezoneRow>

      {expanded && (
        <TimezoneRow>
          <SelectField
            horizontal
            noMinWidth
            options={TIMEZONES.map((tz) => [tz.offset, tz.label])}
            value={(timezone || 0).toString()}
            onChange={(e) => {
              if (e && e.currentTarget) {
                updateTimezone(e.currentTarget.value);
              }
            }}
          />
        </TimezoneRow>
      )}
    </div>
  );
};

const TimezoneRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  width: 100%;

  .field {
    width: 100%;
    border: 1px solid #e9e9e9;
    border-radius: 3px;
  }
`;

export default TimezoneSelector;
