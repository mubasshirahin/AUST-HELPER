import { useEffect, useRef, useCallback } from 'react';
import { useRoutine } from '../context/RoutineContext';
import {
  loadSettings,
  getPermissionStatus,
  checkClassReminders,
  checkDeadlineReminders,
} from '../utils/notificationService';
import { deadlines } from '../data/mockData';

const POLL_MS = 60 * 1000;

export default function NotificationRunner() {
  const { routine, weekDays } = useRoutine();
  const intervalRef = useRef(null);

  const runChecks = useCallback(() => {
    const settings = loadSettings();
    if (!settings.enabled || getPermissionStatus() !== 'granted') return;
    if (settings.notifyClass) checkClassReminders(routine, weekDays, settings.classReminderMins);
    if (settings.notifyDeadline) checkDeadlineReminders(deadlines, settings.deadlineReminderHours);
  }, [routine, weekDays]);

  useEffect(() => {
    runChecks();
    intervalRef.current = setInterval(runChecks, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [runChecks]);

  return null;
}
