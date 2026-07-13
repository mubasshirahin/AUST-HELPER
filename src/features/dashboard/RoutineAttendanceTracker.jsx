import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { normalizeAccentColor } from '../../utils/colorPalette';
import {
  TrendingUp, AlertTriangle, ShieldAlert, ShieldCheck,
  Info, BookOpen, Trash2
} from 'lucide-react';
import { setUserStorageItem, getUserStorageKey } from '../../utils/authStorage';

const SEMESTER_WEEKS = 14;
const MIN_ATTENDANCE = 75;

const storageKeyTypes = {
  enabled: 'routineAttendanceEnabled',
  data: 'routineAttendanceData'
};

function loadInitialAttendanceState() {
  try {
    const enabledKey = getUserStorageKey(storageKeyTypes.enabled);
    const dataKey = getUserStorageKey(storageKeyTypes.data);
    return {
      isEnabled: enabledKey ? localStorage.getItem(enabledKey) === 'true' : false,
      attendanceData: dataKey ? JSON.parse(localStorage.getItem(dataKey) || '{}') : {}
    };
  } catch { return { isEnabled: false, attendanceData: {} }; }
}

function loadTelegramChatId() { return localStorage.getItem('telegram_chat_id') || ''; }
function loadIsTelegramRegistered() { return localStorage.getItem('telegram_is_registered') === 'true'; }

function AttendanceRing({ percentage, size = 52, strokeWidth = 4, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percentage, 100) / 100);
  const center = size / 2;
  const isLow = percentage < MIN_ATTENDANCE;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--bg-card)" strokeWidth={strokeWidth} />
      <circle
        cx={center} cy={center} r={radius} fill="none"
        stroke={isLow ? 'var(--accent-amber)' : color || 'var(--accent-emerald)'}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
      />
      <text
        x={center} y={center + 1} textAnchor="middle" dominantBaseline="central"
        fill={isLow ? 'var(--accent-amber)' : 'var(--text-primary)'}
        fontSize={size * 0.26} fontWeight="700" fontFamily="system-ui, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

function MiniSegBar({ attended, missed, unmarked, total }) {
  const aPct = total > 0 ? (attended / total) * 100 : 0;
  const mPct = total > 0 ? (missed / total) * 100 : 0;
  const uPct = total > 0 ? (unmarked / total) * 100 : 0;
  return (
    <div className="att-minibar">
      <div className="att-minibar-seg" style={{ width: `${aPct}%`, background: 'var(--accent-emerald)' }} title="Attended" />
      <div className="att-minibar-seg" style={{ width: `${mPct}%`, background: 'var(--accent-rose)' }} title="Missed" />
      <div className="att-minibar-seg" style={{ width: `${uPct}%`, background: 'var(--text-tertiary)' }} title="Unmarked" />
    </div>
  );
}

export default function RoutineAttendanceTracker() {
  const { routine, weekDays } = useRoutine();
  const [isEnabled, setIsEnabled] = useState(loadInitialAttendanceState().isEnabled);
  const [attendanceData, setAttendanceData] = useState(loadInitialAttendanceState().attendanceData);
  const [telegramChatId] = useState(loadTelegramChatId);
  const [isTelegramRegistered] = useState(loadIsTelegramRegistered);
  const [telegramAttendance, setTelegramAttendance] = useState({});
  const [loadingTelegram, setLoadingTelegram] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const loadTelegramAttendance = useCallback(async () => {
    if (!telegramChatId) return;
    setLoadingTelegram(true);
    try {
      const response = await fetch(`/api/telegram/attendance?chatId=${encodeURIComponent(telegramChatId)}`);
      const result = await response.json();
      if (result.success && result.records) {
        const telegramData = {};
        result.records.forEach(record => {
          const courseKey = record.course;
          if (!telegramData[courseKey]) telegramData[courseKey] = { attended: 0, total: 0 };
          telegramData[courseKey].total++;
          if (record.attended) telegramData[courseKey].attended++;
        });
        setTelegramAttendance(telegramData);
      }
    } catch (error) {
      console.error('Failed to load Telegram attendance:', error);
    } finally { setLoadingTelegram(false); }
  }, [telegramChatId]);

  useEffect(() => {
    if (isTelegramRegistered && telegramChatId && isEnabled) {
      loadTelegramAttendance();
      const intervalId = setInterval(loadTelegramAttendance, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isTelegramRegistered, telegramChatId, isEnabled, loadTelegramAttendance]);

  useEffect(() => { setUserStorageItem(storageKeyTypes.enabled, isEnabled); }, [isEnabled]);
  useEffect(() => { setUserStorageItem(storageKeyTypes.data, attendanceData); }, [attendanceData]);

  const courseStats = useMemo(() => {
    const stats = {};
    weekDays.forEach(day => {
      const classes = routine[day] || [];
      classes.forEach(cls => {
        const courseKey = cls.part ? `${cls.course}-${cls.part}` : cls.course;
        if (!stats[courseKey]) {
          stats[courseKey] = {
            course: cls.course,
            fullKey: courseKey,
            name: cls.name,
            part: cls.part || null,
            color: cls.color,
            classesPerWeek: 0,
            totalSemesterClasses: 0
          };
        }
        stats[courseKey].classesPerWeek += cls.biWeekly ? 0.5 : 1;
      });
    });
    Object.values(stats).forEach(stat => {
      stat.totalSemesterClasses = stat.classesPerWeek * SEMESTER_WEEKS;
    });
    return stats;
  }, [routine, weekDays]);

  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    let warningCount = 0;
    let totalCanMiss = 0;

    Object.values(courseStats).forEach(stat => {
      const localAtt = attendanceData[stat.fullKey]?.attended || 0;
      const telegramData = telegramAttendance[stat.fullKey] || telegramAttendance[stat.course];
      const telegramAtt = typeof telegramData === 'object' ? (telegramData.attended || 0) : 0;
      const telegramTot = typeof telegramData === 'object' ? (telegramData.total || 0) : 0;
      const attended = Math.max(localAtt, telegramAtt);
      const totalMarked = Math.max(localAtt, telegramTot);
      const missed = totalMarked - attended;
      totalAttended += attended;
      totalClasses += stat.totalSemesterClasses;

      const needed = Math.ceil(stat.totalSemesterClasses * (MIN_ATTENDANCE / 100));
      const canMiss = Math.max(0, stat.totalSemesterClasses - needed - missed);

      if (stat.totalSemesterClasses > 0 &&
        ((attended / stat.totalSemesterClasses) * 100) < MIN_ATTENDANCE) {
        warningCount++;
      }
      totalCanMiss += canMiss;
    });

    const average = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    return {
      average: parseFloat(average.toFixed(1)),
      totalAttended,
      totalClasses,
      warningCount,
      totalCanMiss
    };
  }, [courseStats, attendanceData, telegramAttendance]);

  const resetAttendance = (course) => {
    setAttendanceData(prev => { const n = { ...prev }; delete n[course]; return n; });
  };

  if (Object.keys(courseStats).length === 0) return null;

  return (
    <div className="att-tracker-wrap glass-card-static animate-fadeInUp">
      <div className="att-header-row">
        <div className="att-header-left">
          <div className="att-header-icon" style={{ background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="att-header-title">Attendance Tracker</div>
            <div className="att-header-sub">
              {isEnabled
                ? `${SEMESTER_WEEKS}-week semester \u00b7 ${Object.keys(courseStats).length} courses`
                : 'Track your attendance across the semester'}
            </div>
          </div>
        </div>
        <div className="att-header-actions">
          <button className="att-guide-btn" onClick={() => setShowGuide(!showGuide)} title="Attendance guide">
            <Info size={15} />
          </button>
          <button
            className="att-guide-btn"
            onClick={() => {
              if (dataKey) localStorage.removeItem(dataKey);
              if (enabledKey) localStorage.removeItem(enabledKey);
              setAttendanceData({});
              setIsEnabled(false);
            }}
            title="Reset all attendance data"
            style={{ color: 'var(--accent-rose)' }}
          >
            <Trash2 size={15} />
          </button>
          <button
            className="att-toggle-btn"
            onClick={() => setIsEnabled(!isEnabled)}
            aria-label={isEnabled ? 'Disable tracking' : 'Enable tracking'}
          >
            <div className={`att-toggle-track${isEnabled ? ' active' : ''}`}>
              <div className="att-toggle-thumb" />
            </div>
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="att-guide-panel">
          <div className="att-guide-title">
            <AlertTriangle size={14} /> Why 75% Attendance?
          </div>
          <p>
            AUST requires a <strong>minimum 75% attendance</strong> in each course to sit for semester exams.
            Falling below means you may be <strong>restricted from appearing</strong>.
          </p>
          <div className="att-guide-stats">
            <div className="att-guide-stat">
              <span className="att-guide-stat-val">75%</span>
              <span className="att-guide-stat-lbl">Minimum required</span>
            </div>
            <div className="att-guide-stat">
              <span className="att-guide-stat-val">{overallStats.totalCanMiss}</span>
              <span className="att-guide-stat-lbl">Classes you can still miss</span>
            </div>
            <div className="att-guide-stat">
              <span className="att-guide-stat-val">{overallStats.warningCount}</span>
              <span className="att-guide-stat-lbl">Course(s) at risk</span>
            </div>
          </div>
          <p style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
            Tip: Mark your absences honestly to get accurate can-miss calculations.
            Attendance is synced from Telegram bot &mdash; reset per-course data with the button if needed.
          </p>
        </div>
      )}

      {isEnabled ? (
        <>
          <div className="att-hero-box">
            <div className="att-hero-body">
              <div className="att-hero-label">Overall Attendance</div>
              <div className="att-hero-value"
                style={{
                  color: overallStats.average >= MIN_ATTENDANCE ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                }}
              >
                {overallStats.average}%
                {overallStats.average >= MIN_ATTENDANCE
                  ? <ShieldCheck size={18} style={{ marginLeft: 6 }} />
                  : <ShieldAlert size={18} style={{ marginLeft: 6 }} />
                }
              </div>
              <div className="att-hero-bar-wrap">
                <div className="att-hero-bar-bg">
                  <div className="att-hero-bar-fill"
                    style={{
                      width: `${Math.min(overallStats.average, 100)}%`,
                      background: overallStats.average >= MIN_ATTENDANCE ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                    }}
                  />
                </div>
                <span className="att-hero-bar-label">{MIN_ATTENDANCE}% minimum</span>
              </div>
            </div>
          </div>

          <div className="att-course-grid">
            {Object.values(courseStats).map((stat) => {
              const localAtt = attendanceData[stat.fullKey]?.attended || 0;
              const telegramData = telegramAttendance[stat.fullKey] || telegramAttendance[stat.course];
              const telegramAtt = typeof telegramData === 'object' ? (telegramData.attended || 0) : 0;
              const telegramTot = typeof telegramData === 'object' ? (telegramData.total || 0) : 0;
              const attended = Math.max(localAtt, telegramAtt);
              const totalMarked = Math.max(localAtt, telegramTot);
              const missed = totalMarked - attended;
              const unmarked = stat.totalSemesterClasses - totalMarked;
              const percentage = stat.totalSemesterClasses > 0 ? ((attended / stat.totalSemesterClasses) * 100) : 0;
              const isDanger = percentage < MIN_ATTENDANCE;
              const accentColor = normalizeAccentColor(stat.color);

              const neededTotal = Math.ceil(stat.totalSemesterClasses * (MIN_ATTENDANCE / 100));
              const canMissThis = Math.max(0, stat.totalSemesterClasses - neededTotal - missed);

              return (
                <div key={stat.fullKey} className={`att-course-card${isDanger ? ' att-course-danger' : ''}`}>
                  <div className="att-course-row">
                    <div className="att-course-info">
                      <div className="att-course-code" style={{ color: accentColor }}>
                        {stat.course}
                        {stat.part && <span className="att-course-part">Part {stat.part}</span>}
                      </div>
                      <div className="att-course-sub">
                        <span className="att-course-stat att-course-stat-att" title="Attended">{attended}</span>
                        <span className="att-course-stat-sep">/</span>
                        <span className="att-course-stat att-course-stat-mis" title="Missed">{missed}</span>
                        <span className="att-course-stat-sep">/</span>
                        <span className="att-course-stat att-course-stat-umr" title="Unmarked">{unmarked}</span>
                        <span className="att-course-stat-hint">att/miss/unmk</span>
                      </div>
                    </div>
                    <button className="att-course-reset" onClick={() => resetAttendance(stat.fullKey)} title="Reset attendance">&times;</button>
                  </div>

                  <div className="att-course-buffer">
                    <span className="att-buffer-label">
                      You can miss <strong>{canMissThis}</strong> more class{canMissThis !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  <MiniSegBar attended={attended} missed={missed} unmarked={unmarked} total={stat.totalSemesterClasses} />


                </div>
              );
            })}
          </div>

          {loadingTelegram && (
            <div className="att-telegram-syncing">Syncing with Telegram...</div>
          )}
        </>
      ) : (
        <div className="att-disabled">
          <div className="att-disabled-icon">
            <BookOpen size={28} />
          </div>
          <div className="att-disabled-title">Attendance tracking is off</div>
          <div className="att-disabled-desc">
            Toggle the switch above to start tracking {Object.keys(courseStats).length} courses
            across {SEMESTER_WEEKS} weeks and see how many classes you can miss.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (dataKey) localStorage.removeItem(dataKey);
              setAttendanceData({});
            }}
            style={{ marginTop: '12px', fontSize: '11px' }}
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}
