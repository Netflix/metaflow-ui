import React, { useState } from 'react';
import spacetime from 'spacetime';

//
// Timezone data
//

export const TIMEZONES = makeTZData();
// used for displaying users local timezone
export const localTimeZone = TIMEZONES.find(
  (tz) =>
    tz[1].includes(spacetime().timezone().current.offset.toString()) && tz[1].includes(spacetime().timezone().name),
);

function makeTZData() {
  const timezoneData = Object.entries(spacetime().timezones).filter(
    (key) => !key[0].includes('etc') && !key[0].includes('utc'),
  );

  // [string, string] = [value, label]
  const tzs: [string, string][] = [];
  timezoneData.forEach(([key, value], index) => {
    const parseHour = (value: number) => {
      if (value < -9.5 || value > 9.5) {
        return value > 9 ? `+${Math.floor(value)}` : value;
      } else {
        return value < 0 ? `-0${Math.floor(value * -1)}` : `+0${Math.floor(value)}`;
      }
    };

    // offsets end section can be 00, 15, 30, or 45
    const offset = `${parseHour(spacetime().goto(key).timezone().current.offset)}:${
      Number.isInteger(value.offset) ? '00' : `${60 * (value.offset - Math.floor(value.offset))}`
    }`;

    let region = key.split('/')[0];
    region = `${region[0].toUpperCase()}${region.slice(1)}`;
    let city = key.split('/')[1].replace(/_/g, ' ');
    city = `${city[0].toUpperCase()}${city.slice(1)}`;

    // we need to add index to diffrentiate the offsets from one another
    tzs.push([`${offset}|${index}`, `(GMT${offset}) ${region}/${city}`]);
  });

  const getOffset = (a: string) => parseFloat(a.split('|')[0]);
  tzs.sort((a, b) =>
    getOffset(a[0]) === getOffset(b[0]) ? a[1].localeCompare(b[1]) : getOffset(a[0]) - getOffset(b[0]),
  );

  return tzs;
}

export function findTimezone(userTz: string): [string, string] | undefined {
  return TIMEZONES.find((tz) => tz[0].split('|')[1] === userTz.split('|')[1]);
}

//
// Context
//

type TimezoneContextProps = {
  timezone: string;
  updateTimezone: (zone: string) => void;
};

export const TimezoneContext = React.createContext<TimezoneContextProps>({
  timezone: localTimeZone ? localTimeZone[0] : '+00:00|197', // +00:00 Reykjavik
  updateTimezone: () => null,
});

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezone] = useState(
    localStorage.getItem('selected-timezone') || (localTimeZone ? localTimeZone[0] : '+00:00|197'),
  );

  const updateTimezone = (zone: string) => {
    setTimezone(zone);
    localStorage.setItem('selected-timezone', zone);
  };

  const contextValue = {
    timezone,
    updateTimezone,
  };

  return <TimezoneContext.Provider value={contextValue}>{children}</TimezoneContext.Provider>;
};
