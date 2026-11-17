import { useEffect, useState } from 'react';

/** ready must stay true for holdMs before auto-capture may start. */
export function useReadyHold(ready: boolean, holdMs: number): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!ready) {
      setHeld(false);
      return;
    }
    const timer = setTimeout(() => setHeld(true), holdMs);
    return () => clearTimeout(timer);
  }, [ready, holdMs]);

  return held;
}
