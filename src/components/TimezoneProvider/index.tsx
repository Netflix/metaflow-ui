import React, { useState } from 'react';

type TimezoneContextProps = {
  timezone: string;
  updateTimezone: (zone: string) => void;
};

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
