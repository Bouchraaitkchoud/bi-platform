import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number = 1000): T {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
}
