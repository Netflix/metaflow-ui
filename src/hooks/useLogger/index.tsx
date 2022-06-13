import React, { useState, useEffect, useContext, useCallback } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import { endLogging, startLogging } from '../../utils/debugdb';

//
// Context
//

interface IContextProps {
  enabled: boolean;
  start: () => void;
  stop: () => void;
}

export const LoggingContext = React.createContext({} as IContextProps);

export const LoggingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(false);

  const start = () => {
    setEnabled(true);
    startLogging();
    localStorage.setItem('debug-mode', 'true');
  };

  const stop = () => {
    endLogging();
    localStorage.setItem('debug-mode', 'false');
    setEnabled(false);
  };

  const contextValue = {
    enabled,
    start,
    stop,
  };

  return <LoggingContext.Provider value={contextValue}>{children}</LoggingContext.Provider>;
};

//
// Hook
//

function useLogger(): { enabled: boolean; startLogging: () => void; stopLogging: () => void } {
  const context = useContext(LoggingContext);
  const [q, sq] = useQueryParams({ debug: StringParam });

  const start = useCallback(() => {
    context.start();
  }, [context]);

  const stop = useCallback(() => {
    sq({ debug: undefined }, 'replaceIn');
    context.stop();
  }, [context, sq]);

  useEffect(() => {
    const setting = localStorage.getItem('debug-mode');
    if ((setting && setting === 'true') || q?.debug === '1') {
      start();
    } else {
      stop();
    }
  }, [q?.debug, start, stop]);

  return { enabled: context.enabled, startLogging: start, stopLogging: stop };
}

export default useLogger;
