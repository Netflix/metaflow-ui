import React, { useEffect, useState } from 'react';

const AutoUpdating: React.FC<{ enabled: boolean; content: () => React.ReactNode }> = ({ content, enabled }) => {
  const rerender = useState(0);

  useEffect(() => {
    let t = 0;
    if (enabled) {
      t = window.setInterval(() => {
        rerender[1]((tick) => tick + 1);
      }, 1000);
    }
    return () => window.clearInterval(t);
  }, [enabled]); // eslint-disable-line

  return <>{content()}</>;
};

export default AutoUpdating;
