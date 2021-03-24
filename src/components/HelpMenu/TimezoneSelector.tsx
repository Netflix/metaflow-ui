import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import spacetime from 'spacetime';
import styled from 'styled-components';
import { DropdownOption } from '../Form/Dropdown';
import { DropdownField } from '../Form';
import { TimezoneContext, TIMEZONES } from '../TimezoneProvider';

const userTimezone = TIMEZONES.find((tz) => tz.offset === getCurrentTimeZoneOffset());
const ZONES: [string, string][] = TIMEZONES.map((tz) => [tz.offset, tz.label]);

const TimezoneSelector: React.FC = () => {
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const { t } = useTranslation();

  return (
    <div>
      <TimezoneRow>
        <DropdownField
          label={t('help.timezone')}
          options={ZONES.map((o) => [o[0], o[1]])}
          value={(timezone || 0).toString()}
          onChange={(e) => e && updateTimezone(e.currentTarget.value)}
        >
          {userTimezone && (
            <>
              <label>{t('help.local-time')}</label>
              <TimezoneOption
                textOnly
                variant={timezone === userTimezone.offset ? 'primaryText' : 'text'}
                size="sm"
                onClick={() => {
                  updateTimezone(userTimezone.offset);
                }}
              >
                {userTimezone.label}
              </TimezoneOption>
            </>
          )}
          <label>{t('help.timezones')}</label>
          {ZONES.map((o, index) => (
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
