import React, { useContext, useState } from 'react';
import { HelpMenuRow } from '.';
import { SelectField } from '../Form';
import { TimezoneContext, TIMEZONES } from '../TimezoneProvider';
import Toggle from '../Toggle';

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const [expanded, setExpanded] = useState(timezone !== '+00:00' ? true : false);

  return (
    <div>
      <HelpMenuRow>
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
      </HelpMenuRow>

      {expanded && (
        <HelpMenuRow>
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
        </HelpMenuRow>
      )}
    </div>
  );
};

export default TimezoneSelector;
