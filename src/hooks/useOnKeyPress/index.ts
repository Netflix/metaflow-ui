import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

//
// Hook for simple subscribe to global keyboard events. Ideal to handle Escape event.
//

const callbackStore: Record<string, Record<string, () => void>> = {};

function handleKeyPress(event: KeyboardEvent) {
  if (callbackStore[event.key]) {
    for (const hookid in callbackStore[event.key]) {
      callbackStore[event.key][hookid]();
    }
  }
}

window.addEventListener('keydown', handleKeyPress);

function useOnKeyPress(key: string, callback: () => void): void {
  const [hookid] = useState(v4());

  useEffect(() => {
    if (!callbackStore[key]) {
      callbackStore[key] = {};
    }
    callbackStore[key][hookid] = callback;

    return () => {
      delete callbackStore[key][hookid];
    };
  }, [callback, hookid, key]);
}

export default useOnKeyPress;
