import React, { useEffect, useState } from 'react';

type TimezoneContextProps = {
  timezone: number;
  updateTimezone: (zone: number) => void;
};

export const TimezoneContext = React.createContext<TimezoneContextProps>({ timezone: 0, updateTimezone: () => null });

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezone] = useState(0);

  useEffect(() => {
    const ls = localStorage.getItem('timezone');

    if (ls && parseInt(ls)) {
      setTimezone(parseInt(ls));
    }
  }, []);

  const updateTimezone = (zone: number) => {
    setTimezone(zone);
  };

  const contextValue = {
    timezone,
    updateTimezone,
  };

  return <TimezoneContext.Provider value={contextValue}>{children}</TimezoneContext.Provider>;
};
