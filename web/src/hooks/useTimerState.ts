import { useState, useEffect } from 'react';

interface TimerInit {
  timerSeconds?: number;
  timerRunning?: boolean;
}

export function useTimerState(initial?: TimerInit) {
  const [timerSeconds, setTimerSeconds] = useState(initial?.timerSeconds ?? 2700);
  const [timerRunning, setTimerRunning] = useState(initial?.timerRunning ?? false);

  // Countdown effect
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  return { timerSeconds, timerRunning, setTimerSeconds, setTimerRunning };
}
