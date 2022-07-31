import React, { useEffect, useState } from 'react';

//
// Container to force rerender every second. Useful for time based components where we are
// calculating time on client side
//

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
  }, [enabled, rerender]);

  return <>{content()}</>;
};

export default AutoUpdating;
