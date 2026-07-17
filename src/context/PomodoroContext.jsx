import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PomodoroContext = createContext(null);

/* ─── Constants (exported so consumers can import directly) ─── */
export const FOCUS = 25 * 60;
export const BREAK = 5 * 60;

/* ─── Shared formatter ─── */
export function formatPomTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/* ─── Provider ─── */
export function PomodoroProvider({ children }) {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  /* Timer tick — cleanup on deps change OR unmount is handled by the returned fn */
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            const nextMode = mode === 'focus' ? 'break' : 'focus';
            if (mode === 'focus') setSessions((s) => s + 1);
            setMode(nextMode);
            return nextMode === 'focus' ? FOCUS : BREAK;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const toggle = useCallback(() => setIsRunning((r) => !r), []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS : BREAK);
  }, [mode]);

  const switchMode = useCallback((m) => {
    clearInterval(intervalRef.current);
    setMode(m);
    setIsRunning(false);
    setTimeLeft(m === 'focus' ? FOCUS : BREAK);
  }, []);

  /* Stabilise the context value so only actual state changes trigger re-renders */
  const value = useMemo(
    () => ({ mode, timeLeft, isRunning, sessions, toggle, reset, switchMode }),
    [mode, timeLeft, isRunning, sessions, toggle, reset, switchMode],
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider');
  return ctx;
}
