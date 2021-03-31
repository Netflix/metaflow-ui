import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import { DropdownOption } from '../Form/Dropdown';
import { DropdownField } from '../Form';
import { TimezoneContext } from '../TimezoneProvider';

const timezoneData = Object.entries(spacetime().timezones)
  .filter((key) => !key[0].includes('etc') && !key[0].includes('utc'))
  .sort((a, b) => (a[1].offset === b[1].offset ? a[0].localeCompare(b[0]) : a[1].offset - b[1].offset));

const tZones: [string, string][] = [];
timezoneData.forEach(([key, value], index) => {
  const parseHour = (value: number) => {
    if (value < -9.5 || value > 9.5) {
      return value > 9 ? `+${Math.floor(value)}` : value;
    } else {
      return value < 0 ? `-0${Math.floor(value * -1)}` : `+0${Math.floor(value)}`;
    }
  };

  // offsets end section can be 00, 15, 30, or 45
  const offset = `${parseHour(value.offset)}:${
    Number.isInteger(value.offset) ? '00' : `${60 * (value.offset - Math.floor(value.offset))}`
  }`;

  let region = key.split('/')[0];
  region = `${region[0].toUpperCase()}${region.slice(1)}`;
  let city = key.split('/')[1].replace(/_/g, ' ');
  city = `${city[0].toUpperCase()}${city.slice(1)}`;

  // we need to add index to diffrentiate the offsets from one another
  tZones.push([`${offset}|${index}`, `(GMT${offset}) ${region}/${city}`]);
});

const userSelectedTimezoneFunc = (userTz: string) => tZones.find((tz) => tz[0] === userTz);
// used for displaying users local timezone
const localTimeZone = tZones.find(
  (tz) =>
    tz[1].includes(spacetime().timezone().current.offset.toString()) && tz[1].includes(spacetime().timezone().name),
);

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const { t } = useTranslation();
  // used for displaying the users selected timezone
  const userTimezone = userSelectedTimezoneFunc(timezone);

  return (
    <div>
      <TimezoneRow>
        <DropdownField
          label={t('help.timezone')}
          options={tZones.map((o) => [o[0], o[1]])}
          value={(timezone || 0).toString()}
          onChange={(e) => e && updateTimezone(e.currentTarget.value)}
        >
          {localTimeZone && (
            <>
              <label>{t('help.local-timezone')}</label>
              <TimezoneOption
                textOnly
                variant={'text'}
                size="sm"
                onClick={() => {
                  updateTimezone(localTimeZone[0]);
                }}
              >
                {localTimeZone[1]}
              </TimezoneOption>
            </>
          )}
          {userTimezone && (
            <>
              <label>{t('help.selected-time')}</label>
              <TimezoneOption
                textOnly
                variant={timezone === userTimezone[0] ? 'primaryText' : 'text'}
                size="sm"
                onClick={() => {
                  updateTimezone(userTimezone[0]);
                }}
              >
                {userTimezone[1]}
              </TimezoneOption>
            </>
          )}
          <label>{t('help.timezones')}</label>
          {tZones.map((o, index) => (
            <TimezoneOption
              key={o[0] + index}
              textOnly
              variant={timezone === o[0] ? 'primaryText' : 'text'}
              size="sm"
              onClick={() => {
                updateTimezone(o[0]);
              }}
            >
              {o[1]}
            </TimezoneOption>
          ))}
        </DropdownField>
      </TimezoneRow>
    </div>
  );
};

//
// Style
//

const TimezoneRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rem 0.5rem;
  width: 100%;
  color: #666;

  .field {
    color: #333;
    margin: 0.5rem 0;
    width: 100%;
  }
  label {
    margin: 0.5rem 0;

    &:first-of-type {
      margin: 0 0 0.5rem;
    }
  }
`;

const TimezoneOption = styled(DropdownOption)`
  white-space: pre-line;
  text-align: left;
`;

export default TimezoneSelector;
