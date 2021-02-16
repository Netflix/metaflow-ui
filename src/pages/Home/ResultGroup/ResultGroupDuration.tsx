import React, { useEffect, useState } from 'react';
import { Run } from '../../../types';
import { getRunDuration } from '../../../utils/run';

const ResultGroupDuration: React.FC<{ run: Run }> = ({ run }) => {
  const rerender = useState(0);
  // If run is in running state, we want to force update every second for duration rendering
  useEffect(() => {
    let t = 0;
    if (run.status === 'running') {
      t = setInterval(() => {
        rerender[1]((tick) => tick + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [run.status]); // eslint-disable-line

  return <>{getRunDuration(run)}</>;
};

export default ResultGroupDuration;
