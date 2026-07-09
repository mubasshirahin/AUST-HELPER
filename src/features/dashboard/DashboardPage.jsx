import { useMemo, useState, useEffect } from 'react';
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
  TrendingUp, Percent, Clock, BookOpen, LayoutDashboard,
  CalendarDays, Target, Zap, AlertTriangle,
} from 'lucide-react';
import { getUserStorageItem, getCurrentUserId } from '../../utils/authStorage';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';

const FOCUS_SECTIONS = {
  overview: ['all', 'stats', 'schedule', 'progress', 'notif', 'notice'],
  schedule: ['all', 'schedule', 'notif', 'notice'],
  progress: ['all', 'progress', 'stats', 'notif', 'notice'],
};

const storageKeyType = 'semesterResults';

const focusModes = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Full picture', color: 'blue' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, desc: 'Classes & routine', color: 'purple' },
  { id: 'progress', label: 'Progress', icon: Target, desc: 'Grades & goals', color: 'emerald' },
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
    },
    {
      label: 'Avg. Attendance',
      value: hasAttendance ? `${stats.avgAttendance}%` : '0%',
      placeholder: !hasAttendance,
      icon: Percent,
      color: 'var(--accent-emerald)',
      bg: 'var(--accent-emerald-glow)',
      accent: 'emerald',
    },
    {
      label: 'Pending Deadlines',
      value: animatedDeadlines,
      icon: Clock,
      color: stats.upcomingDeadlines > 3 ? 'var(--accent-rose)' : 'var(--accent-amber)',
      bg: stats.upcomingDeadlines > 3 ? 'var(--accent-rose-glow)' : 'var(--accent-amber-glow)',
      accent: stats.upcomingDeadlines > 3 ? 'rose' : 'amber',
    },
    {
      label: 'Credits Completed',
      value: animatedCredits,
      icon: BookOpen,
      color: 'var(--accent-purple)',
      bg: 'var(--accent-purple-glow)',
      accent: 'purple',
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
            <div className="quick-stat-shine" aria-hidden="true" />
            <div className="quick-stat-icon" style={{ background: item.bg, color: item.color }}>
              <Icon size={18} />
            </div>
            <div className="quick-stat-body">
              <span className={`quick-stat-value${item.placeholder ? ' placeholder' : ''}`} style={{ color: item.color }}>{item.value}</span>
              <span className="quick-stat-label">{item.label}</span>
            </div>
            <div className="quick-stat-bar" style={{ background: item.color }} />
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [focusMode, setFocusMode] = useState('overview');
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
            <div>
              <h1 className="dash-hero-title">
                {getGreeting()}, <span className="dash-hero-name">{firstName}</span>
              </h1>
              <p className="dash-hero-subtitle">
                Your academic day at a glance — stay on track, stay focused.
              </p>
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
        <div className="dash-section">
          <QuickStats />
        </div>
      )}

      {isVisible('notif') && (
        <div className="dash-section">
          <NotificationBanner />
        </div>
      )}

      {isVisible('schedule') && (
        <div className="dash-section">
          <WeeklyPlanner />
        </div>
      )}

      {isVisible('schedule') && (
        <div className="dash-section">
          <WeekSchedule />
        </div>
      )}

      <div className="dashboard-grid">
        {isVisible('progress') && (
          <div className="dash-section" style={{ gridColumn: '1 / -1' }}>
            <ExamTracker />
          </div>
        )}
        <div className="dashboard-main-col">
          {isVisible('schedule') && (
            <div className="dash-section">
              <RoutineCard />
            </div>
          )}
          {isVisible('progress') && (
            <div className="dash-section">
              <RoutineAttendanceTracker />
            </div>
          )}
        </div>

        <div className="dashboard-side-col">
          {isVisible('progress') && (
            <div className="dash-section">
              <DeadlineTicker />
            </div>
          )}
          {isVisible('notice') && (
            <div className="dash-section">
              <NoticeBoard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
