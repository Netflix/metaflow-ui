import React, { useState } from 'react';

type TimezoneContextProps = {
  timezone: string;
  updateTimezone: (zone: string) => void;
};

export const TIMEZONES = [
  { offset: '-11:00', label: '(GMT-11:00) Pago Pago', tzCode: 'Pacific/Pago_Pago' },
  { offset: '-10:00', label: '(GMT-10:00) Hawaii Time', tzCode: 'Pacific/Honolulu' },
  { offset: '-09:00', label: '(GMT-09:00) Alaska Time', tzCode: 'America/Anchorage' },
  { offset: '-08:00', label: '(GMT-08:00) Pacific Time', tzCode: 'America/Los_Angeles' },
  { offset: '-07:00', label: '(GMT-07:00) Mountain Time', tzCode: 'America/Denver' },
  { offset: '-06:00', label: '(GMT-06:00) Central Time', tzCode: 'America/Chicago' },
  { offset: '-05:00', label: '(GMT-05:00) Eastern Time', tzCode: 'America/New_York' },
  { offset: '-04:00', label: '(GMT-04:00) Atlantic Time - Halifax', tzCode: 'America/Halifax' },
  { offset: '-03:00', label: '(GMT-03:00) Buenos Aires', tzCode: 'America/Argentina/Buenos_Aires' },
  { offset: '-02:00', label: '(GMT-02:00) Sao Paulo', tzCode: 'America/Sao_Paulo' },
  { offset: '-01:00', label: '(GMT-01:00) Azores', tzCode: 'Atlantic/Azores' },
  { offset: '+00:00', label: '(GMT+00:00) London', tzCode: 'Europe/London' },
  { offset: '+01:00', label: '(GMT+01:00) Berlin', tzCode: 'Europe/Berlin' },
  { offset: '+02:00', label: '(GMT+02:00) Helsinki', tzCode: 'Europe/Helsinki' },
  { offset: '+03:00', label: '(GMT+03:00) Istanbul', tzCode: 'Europe/Istanbul' },
  { offset: '+04:00', label: '(GMT+04:00) Dubai', tzCode: 'Asia/Dubai' },
  { offset: '+05:00', label: '(GMT+05:00) Maldives', tzCode: 'Indian/Maldives' },
  { offset: '+06:00', label: '(GMT+06:00) Dhaka', tzCode: 'Asia/Dhaka' },
  { offset: '+07:00', label: '(GMT+07:00) Bangkok', tzCode: 'Asia/Bangkok' },
  { offset: '+08:00', label: '(GMT+08:00) Hong Kong', tzCode: 'Asia/Hong_Kong' },
  { offset: '+09:00', label: '(GMT+09:00) Tokyo', tzCode: 'Asia/Tokyo' },
  { offset: '+10:00', label: '(GMT+10:00) Eastern Time - Brisbane', tzCode: 'Australia/Brisbane' },
  { offset: '+11:00', label: '(GMT+11:00) Eastern Time - Melbourne, Sydney', tzCode: 'Australia/Sydney' },
  { offset: '+12:00', label: '(GMT+12:00) Nauru', tzCode: 'Pacific/Nauru' },
  { offset: '+13:00', label: '(GMT+13:00) Auckland', tzCode: 'Pacific/Auckland' },
];

export const TimezoneContext = React.createContext<TimezoneContextProps>({
  timezone: '+00:00|197', // +00:00 Reykjavik
  updateTimezone: () => null,
});

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezone] = useState(localStorage.getItem('selected-timezone') || '+00:00|197');

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
