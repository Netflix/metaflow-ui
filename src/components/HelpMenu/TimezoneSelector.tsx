import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DropdownField, { DropdownOption } from '../Form/Dropdown';
import { findTimezone, localTimeZone, TimezoneContext, TIMEZONES } from '../TimezoneProvider';
import FilterInput from '../FilterInput';

//
// Show and select used timezone. Works hand in hand with timezone context
//

const TimezoneSelector: React.FC = () => {
  const [filter, setFilter] = useState<string>('');
  const { timezone, updateTimezone } = useContext(TimezoneContext);
  const { t } = useTranslation();
  // used for displaying the users selected timezone
  const userTimezone = findTimezone(timezone);

  return (
    <div>
      <TimezoneRow>
        <DropdownField
          label={t('help.timezone')}
          options={TIMEZONES.map((o) => [o[0], o[1]])}
          value={(timezone || 0).toString()}
          onChange={(e) => e && updateTimezone(e.currentTarget.value)}
          onClose={() => setFilter('')}
        >
          <div style={{ marginBottom: '1rem' }}>
            <FilterInput
              autoFocus
              noIcon
              sectionLabel="Search"
              onSubmit={(e) => {
                if (e) {
                  setFilter(e);
                } else {
                  setFilter('');
                }
              }}
              onChange={(e) => {
                if (e) {
                  setFilter(e);
                } else {
                  setFilter('');
                }
              }}
            />
          </div>
          {localTimeZone && (
            <>
              <label>{t('help.local-timezone')}</label>
              <TimezoneOption
                textOnly
                variant={'text'}
                size="sm"
                onClick={() => {
                  if (localTimeZone) {
                    updateTimezone(localTimeZone[0]);
                  }
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
          {(filter !== ''
            ? TIMEZONES.filter((item) => item[1].toLowerCase().includes(filter.toLowerCase()))
            : TIMEZONES
          ).map((o, index) => (
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
    display: inline-block;
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
