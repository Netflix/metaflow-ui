import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { SelectField } from '../Form';
import { TimezoneContext } from '../TimezoneProvider';
import Toggle from '../Toggle';

const TIMEZONES = [
  { offset: '-11', label: '(GMT-11:00) Pago Pago', tzCode: 'Pacific/Pago_Pago' },
  { offset: '-10', label: '(GMT-10:00) Hawaii Time', tzCode: 'Pacific/Honolulu' },
  { offset: '-9', label: '(GMT-09:00) Alaska Time', tzCode: 'America/Anchorage' },
  { offset: '-8', label: '(GMT-08:00) Pacific Time', tzCode: 'America/Los_Angeles' },
  { offset: '-7', label: '(GMT-07:00) Mountain Time', tzCode: 'America/Denver' },
  { offset: '-6', label: '(GMT-06:00) Central Time', tzCode: 'America/Chicago' },
  { offset: '-5', label: '(GMT-05:00) Eastern Time', tzCode: 'America/New_York' },
  { offset: '-4', label: '(GMT-04:00) Atlantic Time - Halifax', tzCode: 'America/Halifax' },
  { offset: '-3', label: '(GMT-03:00) Buenos Aires', tzCode: 'America/Argentina/Buenos_Aires' },
  { offset: '-2', label: '(GMT-02:00) Sao Paulo', tzCode: 'America/Sao_Paulo' },
  { offset: '-1', label: '(GMT-01:00) Azores', tzCode: 'Atlantic/Azores' },
  { offset: '0', label: '(GMT+00:00) London', tzCode: 'Europe/London' },
  { offset: '1', label: '(GMT+01:00) Berlin', tzCode: 'Europe/Berlin' },
  { offset: '2', label: '(GMT+02:00) Helsinki', tzCode: 'Europe/Helsinki' },
  { offset: '3', label: '(GMT+03:00) Istanbul', tzCode: 'Europe/Istanbul' },
  { offset: '4', label: '(GMT+04:00) Dubai', tzCode: 'Asia/Dubai' },
  // { offset: '04:30', label: '(GMT+04:30) Kabul', tzCode: 'Asia/Kabul' },
  { offset: '5', label: '(GMT+05:00) Maldives', tzCode: 'Indian/Maldives' },
  // { offset: '+05:30', label: '(GMT+05:30) India Standard Time', tzCode: 'Asia/Calcutta' },
  // { offset: '+05:45', label: '(GMT+05:45) Kathmandu', tzCode: 'Asia/Kathmandu' },
  { offset: '6', label: '(GMT+06:00) Dhaka', tzCode: 'Asia/Dhaka' },
  // { offset: '+06:30', label: '(GMT+06:30) Cocos', tzCode: 'Indian/Cocos' },
  { offset: '7', label: '(GMT+07:00) Bangkok', tzCode: 'Asia/Bangkok' },
  { offset: '8', label: '(GMT+08:00) Hong Kong', tzCode: 'Asia/Hong_Kong' },
  // { offset: '+08:30', label: '(GMT+08:30) Pyongyang', tzCode: 'Asia/Pyongyang' },
  { offset: '9', label: '(GMT+09:00) Tokyo', tzCode: 'Asia/Tokyo' },
  // { offset: '+09:30', label: '(GMT+09:30) Central Time - Darwin', tzCode: 'Australia/Darwin' },
  { offset: '10', label: '(GMT+10:00) Eastern Time - Brisbane', tzCode: 'Australia/Brisbane' },
  // { offset: '+10:30', label: '(GMT+10:30) Central Time - Adelaide', tzCode: 'Australia/Adelaide' },
  { offset: '11', label: '(GMT+11:00) Eastern Time - Melbourne, Sydney', tzCode: 'Australia/Sydney' },
  { offset: '12', label: '(GMT+12:00) Nauru', tzCode: 'Pacific/Nauru' },
  { offset: '13', label: '(GMT+13:00) Auckland', tzCode: 'Pacific/Auckland' },
  { offset: '14', label: '(GMT+14:00) Kiritimati', tzCode: 'Pacific/Kiritimati' },
];

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <TimezoneRow>
        <div>Use timezone</div>
        <Toggle value={expanded} onClick={() => setExpanded(!expanded)} />
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
                updateTimezone(parseInt(e?.currentTarget.value));
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
  padding: 0.5rem 1rem;
  width: 100%;

  .field {
    width: 100%;
  }
`;

export default TimezoneSelector;
