import { useEffect, useState } from 'react';
import { safeRead, safeWrite } from '../utils/storageKeys';

// useState wired to localStorage via the safe helpers. Any update to the
// state is persisted on the next tick; reads only happen once on mount.
export const usePersistentState = (storageKey, fallback) => {
  const [state, setState] = useState(() => safeRead(storageKey, fallback));

  useEffect(() => {
    safeWrite(storageKey, state);
  }, [storageKey, state]);

  return [state, setState];
};
