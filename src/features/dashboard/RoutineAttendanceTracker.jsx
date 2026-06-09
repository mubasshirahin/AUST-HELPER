import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { normalizeAccentColor } from '../../utils/colorPalette';
import { ToggleLeft, ToggleRight, TrendingUp, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { getUserStorageItem, setUserStorageItem, getUserStorageKey } from '../../utils/authStorage';

const SEMESTER_WEEKS = 14;
const MIN_ATTENDANCE = 75;

// Storage key types for user-specific storage
const storageKeyTypes = {
  enabled: 'routineAttendanceEnabled',
  data: 'routineAttendanceData'
};

// Load saved state from localStorage (outside component to avoid effect warnings)
function loadInitialAttendanceState() {
  try {
    const enabledKey = getUserStorageKey(storageKeyTypes.enabled);
    const dataKey = getUserStorageKey(storageKeyTypes.data);
    const savedEnabled = enabledKey ? localStorage.getItem(enabledKey) : null;
    const savedAttendance = dataKey ? localStorage.getItem(dataKey) : null;
    return {
      isEnabled: savedEnabled === 'true',
      attendanceData: savedAttendance ? JSON.parse(savedAttendance) : {}
    };
  } catch {
    return { isEnabled: false, attendanceData: {} };
  }
}

function loadTelegramChatId() {
  return localStorage.getItem('telegram_chat_id') || '';
}

function loadIsTelegramRegistered() {
  const saved = localStorage.getItem('telegram_is_registered');
  return saved === 'true';
}

export default function RoutineAttendanceTracker() {
  const { routine, weekDays } = useRoutine();
  const [isEnabled, setIsEnabled] = useState(loadInitialAttendanceState().isEnabled);
  const [attendanceData, setAttendanceData] = useState(loadInitialAttendanceState().attendanceData);
  const [telegramChatId] = useState(loadTelegramChatId);
  const [isTelegramRegistered] = useState(loadIsTelegramRegistered);
  const [telegramAttendance, setTelegramAttendance] = useState({});
  const [loadingTelegram, setLoadingTelegram] = useState(false);

  const loadTelegramAttendance = useCallback(async () => {
    if (!telegramChatId) return;
    
    setLoadingTelegram(true);
    try {
      const response = await fetch(`/api/telegram/attendance?chatId=${encodeURIComponent(telegramChatId)}`);
      const result = await response.json();
      
      if (result.success && result.records) {
        // Process Telegram attendance records - count both attended and absent
        const telegramData = {};
        result.records.forEach(record => {
          const courseKey = record.course;
          if (!telegramData[courseKey]) {
            telegramData[courseKey] = { attended: 0, total: 0 };
          }
          telegramData[courseKey].total++; // Count all marked classes
          if (record.attended) {
            telegramData[courseKey].attended++;
          }
        });
        setTelegramAttendance(telegramData);
      }
    } catch (error) {
      console.error('Failed to load Telegram attendance:', error);
    } finally {
      setLoadingTelegram(false);
    }
  }, [telegramChatId]);

  // Load Telegram attendance data if registered (with polling for real-time updates)
  useEffect(() => {
    if (isTelegramRegistered && telegramChatId && isEnabled) {
      loadTelegramAttendance();
      
      // Poll for new attendance data every 3 seconds
      const intervalId = setInterval(() => {
        loadTelegramAttendance();
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [isTelegramRegistered, telegramChatId, isEnabled, loadTelegramAttendance]);

  // Save state to user-specific localStorage
  useEffect(() => {
    setUserStorageItem(storageKeyTypes.enabled, isEnabled);
  }, [isEnabled]);

  useEffect(() => {
    setUserStorageItem(storageKeyTypes.data, attendanceData);
  }, [attendanceData]);

  // Calculate classes per week for each course from routine
  const courseStats = useMemo(() => {
    const stats = {};
    
    weekDays.forEach(day => {
      const classes = routine[day] || [];
      classes.forEach(cls => {
        const courseKey = cls.course;
        if (!stats[courseKey]) {
          stats[courseKey] = {
            course: cls.course,
            name: cls.name,
            color: cls.color,
            classesPerWeek: 0,
            totalSemesterClasses: 0,
            attended: 0
          };
        }
        stats[courseKey].classesPerWeek += 1;
      });
    });

    // Calculate total semester classes
    Object.values(stats).forEach(stat => {
      stat.totalSemesterClasses = stat.classesPerWeek * SEMESTER_WEEKS;
    });

    return stats;
  }, [routine, weekDays]);

  // Calculate overall attendance percentage (combining local + Telegram data)
  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    let warningCount = 0;

    Object.values(courseStats).forEach(stat => {
      const localAttended = attendanceData[stat.course]?.attended || 0;
      const telegramAttended = telegramAttendance[stat.course] || 0;
      const attended = Math.max(localAttended, telegramAttended); // Use the higher value to avoid double counting
      totalAttended += attended;
      totalClasses += stat.totalSemesterClasses;
      
      const percentage = stat.totalSemesterClasses > 0 
        ? (attended / stat.totalSemesterClasses) * 100 
        : 0;
      if (percentage < MIN_ATTENDANCE && stat.totalSemesterClasses > 0) {
        warningCount++;
      }
    });

    const average = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    return {
      average: parseFloat(average.toFixed(1)),
      totalAttended,
      totalClasses,
      warningCount
    };
  }, [courseStats, attendanceData, telegramAttendance]);

  // eslint-disable-next-line no-unused-vars
  const handleAttendanceChange = (course, delta) => {
    setAttendanceData(prev => {
      const currentAttended = prev[course]?.attended || 0;
      const newAttended = Math.max(0, Math.min(
        courseStats[course]?.totalSemesterClasses || 0,
        currentAttended + delta
      ));
      return {
        ...prev,
        [course]: { attended: newAttended }
      };
    });
  };

  const resetAttendance = (course) => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      delete newData[course];
      return newData;
    });
  };

  if (Object.keys(courseStats).length === 0) {
    return null;
  }

  return (
    <div className="glass-card-static routine-attendance-tracker animate-fadeInUp">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="icon" 
            style={{ 
              backgroundColor: isEnabled ? 'var(--accent-emerald-glow)' : 'var(--accent-amber-glow)', 
              color: isEnabled ? 'var(--accent-emerald)' : 'var(--accent-amber)', 
              padding: '6px', 
              borderRadius: '8px' 
            }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>
              Semester Attendance
            </h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
              Track progress across {SEMESTER_WEEKS} weeks
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          aria-label={isEnabled ? 'Disable routine attendance tracking' : 'Enable routine attendance tracking'}
        >
          {isEnabled ? (
            <ToggleRight size={28} style={{ color: 'var(--accent-emerald)' }} />
          ) : (
            <ToggleLeft size={28} style={{ color: 'var(--text-tertiary)' }} />
          )}
        </button>
      </div>

          {isEnabled ? (
            <>


          {/* Course progress list - Compact minimalist design */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.values(courseStats).map((stat) => {
              const localAttended = attendanceData[stat.course]?.attended || 0;
              const telegramData = telegramAttendance[stat.course];
              const telegramAttended = typeof telegramData === 'object' ? (telegramData.attended || 0) : 0;
              const telegramTotalMarked = typeof telegramData === 'object' ? (telegramData.total || 0) : 0;
              const attended = Math.max(localAttended, telegramAttended);
              const totalMarked = Math.max(localAttended, telegramTotalMarked);
              const missed = totalMarked - attended;
              const unmarked = stat.totalSemesterClasses - totalMarked;
              const percentage = stat.totalSemesterClasses > 0 
                ? ((attended / stat.totalSemesterClasses) * 100).toFixed(0) 
                : 0;
              const isDanger = percentage < MIN_ATTENDANCE;
              const accentColor = normalizeAccentColor(stat.color);

              return (
                <div key={stat.course} style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  border: `1px solid ${isDanger ? 'var(--accent-rose)' : 'var(--border-primary)'}`
                }}>
                  {/* Top row: Course name, stats, percentage */}
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: accentColor, minWidth: '80px' }}>
                      {stat.course}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span style={{ color: 'var(--accent-emerald)' }}>{attended}</span>
                      {' / '}
                      <span style={{ color: 'var(--accent-rose)' }}>{missed}</span>
                      {' / '}
                      <span style={{ color: 'var(--accent-amber)' }}>{unmarked}</span>
                      {' / '}
                      {stat.totalSemesterClasses}
                    </span>
                    <span style={{ 
                      fontSize: 'var(--fs-md)', 
                      fontWeight: 'var(--fw-bold)',
                      color: isDanger ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                      marginLeft: 'auto'
                    }}>
                      {percentage}%
                    </span>
                    <button
                      onClick={() => resetAttendance(stat.course)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        fontSize: '14px',
                        padding: '2px 6px'
                      }}
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ position: 'relative', marginTop: '6px', marginBottom: '4px' }}>
                    <div style={{ 
                      height: '6px', 
                      background: 'var(--bg-card)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      display: 'flex'
                    }}>
                      <div style={{ 
                        width: `${(attended / stat.totalSemesterClasses) * 100}%`,
                        background: 'var(--accent-emerald)',
                        transition: 'width 0.3s ease'
                      }} />
                      <div style={{ 
                        width: `${(missed / stat.totalSemesterClasses) * 100}%`,
                        background: 'var(--accent-rose)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      left: `${MIN_ATTENDANCE}%`,
                      top: '-2px',
                      bottom: '-2px',
                      width: '1.5px',
                      background: 'var(--accent-amber)',
                      opacity: 0.6
                    }} />
                  </div>

                  {/* Bottom row: Labels */}
                  <div className="flex items-center gap-3" style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                    <span>✅{attended}</span>
                    <span>❌{missed}</span>
                    <span>⏳{unmarked}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)' }}>
          <p>Toggle on to track semester attendance based on your routine</p>
          <p style={{ marginTop: '4px' }}>
            Shows {Object.keys(courseStats).length} courses × {SEMESTER_WEEKS} weeks
          </p>
        </div>
      )}
    </div>
  );
}