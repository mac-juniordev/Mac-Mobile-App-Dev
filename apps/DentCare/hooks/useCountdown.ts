import { useState, useEffect } from 'react';
import { getCountdown } from '../utils/dateHelpers';

/**
 * Live countdown hook — updates every second.
 * Returns the current countdown string for the given date/time.
 */
export const useCountdown = (
  date: string | Date | null,
  time: string | null
): string => {
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!date || !time) {
      setCountdown('');
      return;
    }

    // Update immediately
    setCountdown(getCountdown(date, time));

    // Update every second
    const interval = setInterval(() => {
      setCountdown(getCountdown(date, time));
    }, 1000);

    return () => clearInterval(interval);
  }, [date, time]);

  return countdown;
};