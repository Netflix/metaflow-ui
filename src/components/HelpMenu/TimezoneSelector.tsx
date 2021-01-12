import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import { SelectField } from '../Form';
import { TimezoneContext, TIMEZONES } from '../TimezoneProvider';

const userTimezone = TIMEZONES.find((tz) => tz.offset === getCurrentTimeZoneOffset());
const ZONES: [string, string][] = TIMEZONES.map((tz) => [tz.offset, tz.label]);

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const { t } = useTranslation();

  return (
    <div>
      <TimezoneRow>
        <div>{t('help.timezone')}</div>
        <SelectField
          horizontal
          noMinWidth
          options={[]}
          value={(timezone || 0).toString()}
          onChange={(e) => {
            if (e && e.currentTarget) {
              updateTimezone(e.currentTarget.value);
            }
          }}
        >
          {userTimezone && (
            <optgroup label={t('help.local-time')}>
              <option value={userTimezone.offset}>{userTimezone.label}</option>
            </optgroup>
          )}
          <optgroup label={t('help.timezones')}>
            {ZONES.map((o, index) => (
              <option key={o[0] + index} value={o[0]}>
                {o[1]}
              </option>
            ))}
          </optgroup>
        </SelectField>
      </TimezoneRow>
    </div>
  );
};

//
// Utils
//

function getCurrentTimeZoneOffset() {
  const currentTimezone = spacetime().timezone().current.offset;
  if (currentTimezone > -10 && currentTimezone < 10) {
    return `${currentTimezone < 0 ? '-' : '+'}0${Math.abs(currentTimezone)}:00`;
  }
  return `${currentTimezone < 0 ? '' : '+'}${currentTimezone}:00`;
}

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
    width: 100%;
    border: none;
    border-radius: 3px;
    margin-left: 0.5rem;
  }
`;

export default TimezoneSelector;
