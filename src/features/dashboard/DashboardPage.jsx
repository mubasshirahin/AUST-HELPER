import { useMemo, useState, useEffect, useCallback } from 'react';
import RoutineCard from './RoutineCard';
import ExamTracker from './ExamTracker';
import DeadlineTicker from './DeadlineTicker';
import NoticeBoard from './NoticeBoard';
import WeeklyPlanner from './WeeklyPlanner';
import WeekSchedule from './WeekSchedule';
import NotificationBanner from './NotificationBanner';
import RoutineAttendanceTracker from './RoutineAttendanceTracker';
import GliderTabs from '../../components/GliderTabs';
import { deadlines } from '../../data/mockData';
import {
  TrendingUp, Percent, Clock, BookOpen,
  CalendarDays, Zap, AlertTriangle, Calendar,
  Hourglass, BellRing, Flame,
} from 'lucide-react';
import { getUserStorageItem, getCurrentUserId } from '../../utils/authStorage';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

const FOCUS_SECTIONS = {
  stats: ['stats', 'routine_day', 'deadlines', 'notices', 'notif'],
  routine: ['routine'],
  calendar: ['calendar'],
  exams: ['exams'],
  attendance: ['attendance'],
};

const storageKeyType = 'semesterResults';

/* ─── Study Streak Widget ─── */
function StudyStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aust-study-streak');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        const lastActive = data.lastActive;

        if (lastActive === today) {
          setStreak(data.count || 0);
        } else {
          const lastDate = new Date(lastActive);
          const todayDate = new Date();
          const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            setStreak(data.count || 0);
          } else if (diffDays > 1) {
            setStreak(0);
            localStorage.setItem('aust-study-streak', JSON.stringify({ count: 0, lastActive: today }));
          }
        }
      }
    } catch {}
  }, []);

  const getStreakMessage = () => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return '1 day streak — keep going!';
    if (streak < 7) return `${streak} days — building momentum!`;
    if (streak < 30) return `${streak} days — on fire!`;
    return `${streak} days — legendary!`;
  };

  const getStreakColor = () => {
    if (streak === 0) return 'var(--text-tertiary)';
    if (streak < 3) return 'var(--accent-amber)';
    if (streak < 7) return 'var(--accent-orange)';
    if (streak < 30) return 'var(--accent-rose)';
    return 'var(--accent-amber)';
  };

  return (
    <div className="study-streak-widget">
      <div className="streak-flame" style={{ color: getStreakColor() }}>
        <Flame size={18} />
      </div>
      <div className="streak-info">
        <span className="streak-count" style={{ color: getStreakColor() }}>{streak}</span>
        <span className="streak-label">{getStreakMessage()}</span>
      </div>
    </div>
  );
}

const focusModes = [
  { id: 'stats', label: 'Quick Stats', icon: TrendingUp, desc: 'CGPA & metrics', color: 'blue' },
  { id: 'routine', label: 'Routine Schedule', icon: CalendarDays, desc: 'Weekly timetable', color: 'cyan' },
  { id: 'calendar', label: 'Academic Calendar', icon: Calendar, desc: '14-week view', color: 'purple' },
  { id: 'exams', label: 'Exam Tracker', icon: BookOpen, desc: 'Quiz, Mid & Final', color: 'amber' },
  { id: 'attendance', label: 'Attendance', icon: Percent, desc: 'Semester progress', color: 'emerald' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function useAnimatedValue(target, duration = 900) {
  const [display, setDisplay] = useState('—');

  useEffect(() => {
    if (target === null || target === '—' || target === undefined) {
      setDisplay('—');
      return;
    }

    const num = typeof target === 'number' ? target : parseFloat(target);
    if (Number.isNaN(num)) {
      setDisplay(String(target));
      return;
    }

    const isInt = Number.isInteger(num);
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = num * eased;
      setDisplay(isInt ? String(Math.round(current)) : current.toFixed(2));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
}

function QuickStats() {
  const [userResults, setUserResults] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const userId = getCurrentUserId();
    setIsGuest(!userId);
    const stored = getUserStorageItem(storageKeyType);
    setUserResults(stored);
  }, []);

  const stats = useMemo(() => {
    if (isGuest || !userResults) {
      return {
        currentCgpa: null,
        avgAttendance: '—',
        upcomingDeadlines: deadlines.filter((d) => d.dueDate.getTime() > Date.now()).length,
        creditsCompleted: 0,
      };
    }

    const completedSems = userResults.filter((r) => r.cgpa !== null);
    const currentCgpa = completedSems.at(-1)?.cgpa ?? null;
    const creditsCompleted = completedSems.reduce((total, sem) => {
      return total + sem.courses.reduce((sum, c) => (c.point !== null ? sum + (Number(c.credit) || 0) : sum), 0);
    }, 0);

    return { currentCgpa, avgAttendance: '—', upcomingDeadlines: 0, creditsCompleted };
  }, [userResults, isGuest]);

  const animatedCgpa = useAnimatedValue(stats.currentCgpa);
  const animatedCredits = useAnimatedValue(stats.creditsCompleted);
  const animatedDeadlines = useAnimatedValue(stats.upcomingDeadlines);

  const hasCgpa = stats.currentCgpa !== null && stats.currentCgpa !== undefined;
  const hasAttendance = stats.avgAttendance !== '—';

  const items = [
    {
      label: 'Current CGPA',
      value: hasCgpa ? animatedCgpa : '0.00',
      placeholder: !hasCgpa,
      icon: TrendingUp,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-glow)',
      accent: 'blue',
      trend: hasCgpa ? (stats.currentCgpa >= 3.0 ? 'up' : stats.currentCgpa >= 2.5 ? 'stable' : 'down') : null,
    },
    {
      label: 'Avg. Attendance',
      value: hasAttendance ? `${stats.avgAttendance}%` : '0%',
      placeholder: !hasAttendance,
      icon: Percent,
      color: 'var(--accent-emerald)',
      bg: 'var(--accent-emerald-glow)',
      accent: 'emerald',
      trend: null,
    },
    {
      label: 'Pending Deadlines',
      value: animatedDeadlines,
      icon: Clock,
      color: stats.upcomingDeadlines > 3 ? 'var(--accent-rose)' : 'var(--accent-amber)',
      bg: stats.upcomingDeadlines > 3 ? 'var(--accent-rose-glow)' : 'var(--accent-amber-glow)',
      accent: stats.upcomingDeadlines > 3 ? 'rose' : 'amber',
      trend: null,
    },
    {
      label: 'Credits Completed',
      value: animatedCredits,
      icon: BookOpen,
      color: 'var(--accent-purple)',
      bg: 'var(--accent-purple-glow)',
      accent: 'purple',
      trend: null,
    },
  ];

  return (
    <div className="dashboard-quick-stats stagger-children">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`quick-stat-card glass-card-static quick-stat-${item.accent} animate-fadeInUp`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="quick-stat-icon" style={{ background: item.bg, color: item.color, position: 'relative' }}>
              <Icon size={18} />
            </div>
            <div className="quick-stat-body">
              <div className="quick-stat-value-row">
                <span className={`quick-stat-value${item.placeholder ? ' placeholder' : ''}`} style={{ color: item.color }}>{item.value}</span>
                {item.trend && (
                  <span className={`quick-stat-trend trend-${item.trend}`}>
                    {item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'}
                  </span>
                )}
              </div>
              <span className="quick-stat-label">{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [focusMode, setFocusMode] = useState('stats');
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const profileIncomplete = user && (!user.department || !user.batch || !user.section || !user.yearSemester);

  const isVisible = (key) => FOCUS_SECTIONS[focusMode].includes(key);

  return (
    <div className={`dashboard-page dashboard-focus-${focusMode} animate-fadeIn`}>

      <header className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true">
          <div className="dash-hero-grid" />
        </div>
        <div className="dash-hero-content">
          <div className="dash-hero-title-row">
            <div className="dash-hero-icon">
              <Zap size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="dash-hero-title">
                {getGreeting()}, <span className="dash-hero-name">{firstName}</span>
              </h1>
              <p className="dash-hero-subtitle">
                Your academic day at a glance — stay on track, stay focused.
              </p>
            </div>
            <div className="dash-hero-widgets">
              <StudyStreak />
            </div>
          </div>
        </div>
      </header>

      {profileIncomplete && (
        <div className="dash-profile-warning animate-fadeIn">
          <AlertTriangle size={16} />
          <span>Your profile is incomplete. <a href="/settings">Complete it here</a> to unlock all features.</span>
        </div>
      )}

      <GliderTabs
        tabs={focusModes}
        activeTab={focusMode}
        onChange={setFocusMode}
        variant="dashboard"
      />

      {isVisible('stats') && (
        <section className="dash-section-group">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
                <TrendingUp size={16} />
              </span>
              Quick Statistics
            </h2>
          </div>
          <div className="dash-section">
            <QuickStats />
          </div>
        </section>
      )}

      {isVisible('notif') && (
        <div className="dash-section">
          <NotificationBanner />
        </div>
      )}

      {isVisible('routine') && (
        <section className="dash-section-group">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" style={{ background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)' }}>
                <CalendarDays size={16} />
              </span>
              Routine Schedule
            </h2>
            <p className="section-subtitle">Weekly class timetable &amp; semester calendar</p>
          </div>
          <div className="dash-section">
            <WeeklyPlanner />
          </div>
        </section>
      )}

      {isVisible('calendar') && (
        <section className="dash-section-group">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
                <Calendar size={16} />
              </span>
              Academic Calendar
            </h2>
            <p className="section-subtitle">14-week schedule with tasks &amp; events</p>
          </div>
          <div className="dash-section">
            <WeekSchedule />
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        {isVisible('exams') && (
          <section className="dash-section-group" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header">
              <h2 className="section-title">
                <span className="icon" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
                  <BookOpen size={16} />
                </span>
                Exam Tracker
              </h2>
              <p className="section-subtitle">Quiz, Mid &amp; Final exam dates &amp; syllabus</p>
            </div>
            <div className="dash-section">
              <ExamTracker />
            </div>
          </section>
        )}
        <div className="dashboard-main-col">
          {isVisible('routine_day') && (
            <section className="dash-section-group">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="icon" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
                    <Clock size={16} />
                  </span>
                  Today's Routine
                </h2>
              </div>
              <div className="dash-section">
                <RoutineCard />
              </div>
            </section>
          )}
          {isVisible('attendance') && (
            <section className="dash-section-group">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="icon" style={{ background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)' }}>
                    <Percent size={16} />
                  </span>
                  Attendance Progress
                </h2>
              </div>
              <div className="dash-section">
                <RoutineAttendanceTracker />
              </div>
            </section>
          )}
        </div>

        <div className="dashboard-side-col">
          {isVisible('deadlines') && (
            <section className="dash-section-group">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="icon" style={{ background: 'var(--accent-rose-glow)', color: 'var(--accent-rose)' }}>
                    <Hourglass size={16} />
                  </span>
                  Deadlines
                </h2>
              </div>
              <div className="dash-section">
                <DeadlineTicker />
              </div>
            </section>
          )}
          {isVisible('notices') && (
            <section className="dash-section-group">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="icon" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
                    <BellRing size={16} />
                  </span>
                  Notice Board
                </h2>
              </div>
              <div className="dash-section">
                <NoticeBoard />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
