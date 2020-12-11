import React, { useState, useEffect } from 'react';
import { HelpMenuRow } from '.';
import { endLogging, getLogs, startLogging } from '../../utils/debugdb';
import Button from '../Button';
import Toggle from '../Toggle';

const DebugSelector: React.FC = () => {
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    const setting = localStorage.getItem('debug-mode');
    if (setting && setting === 'true') {
      setLogging(true);
      startLogging();
    } else {
      endLogging();
    }
  }, []);

  return (
    <div>
      <HelpMenuRow>
        <div>Record debug info</div>
        <Toggle
          value={logging}
          onClick={() => {
            localStorage.setItem('debug-mode', (!logging).toString());
            setLogging(!logging);
            if (logging) {
              endLogging();
            } else {
              startLogging();
            }
          }}
        />
      </HelpMenuRow>

      {logging && (
        <HelpMenuRow>
          <Button onClick={() => getLogs()}>Donwload logs</Button>
        </HelpMenuRow>
      )}
    </div>
  );
};

export default DebugSelector;
