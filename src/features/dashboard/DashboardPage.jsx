import { useMemo, useState, useEffect } from 'react';
import RoutineCard from './RoutineCard';
import AttendanceWidget from './AttendanceWidget';
import DeadlineTicker from './DeadlineTicker';
import NoticeBoard from './NoticeBoard';
import WeeklyPlanner from './WeeklyPlanner';
import WeekSchedule from './WeekSchedule';
import NotificationBanner from './NotificationBanner';
import RoutineAttendanceTracker from './RoutineAttendanceTracker';
import { deadlines } from '../../data/mockData';
import { TrendingUp, Percent, Clock, BookOpen } from 'lucide-react';
import { getUserStorageItem, getCurrentUserId, getRoleLabel } from '../../utils/authStorage';
import './DashboardPage.css';

const storageKeyType = 'semesterResults';

function QuickStats() {
  const [userResults, setUserResults] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is guest
    const userId = getCurrentUserId();
    setIsGuest(!userId);

    // Load user-specific results (only for authenticated users)
    const stored = getUserStorageItem(storageKeyType);
    setUserResults(stored);
  }, []);

  const stats = useMemo(() => {
    // For guest users, show empty/placeholder data
    // For authenticated users, show their data or placeholders if none saved
    if (isGuest || !userResults) {
      return {
        currentCgpa: null,
        avgAttendance: '—',
        upcomingDeadlines: deadlines.filter(d => d.dueDate.getTime() > Date.now()).length,
        creditsCompleted: 0
      };
    }

    const completedSems = userResults.filter(r => r.cgpa !== null);
    const currentCgpa = completedSems.at(-1)?.cgpa ?? null;

    // Calculate attendance from user's routine attendance data
    const creditsCompleted = completedSems.reduce((total, sem) => {
      return total + sem.courses.reduce((sum, c) => c.point !== null ? sum + (Number(c.credit) || 0) : sum, 0);
    }, 0);

    return { currentCgpa, avgAttendance: '—', upcomingDeadlines: 0, creditsCompleted };
  }, [userResults, isGuest]);

  const items = [
    {
      label: 'Current CGPA',
      value: stats.currentCgpa ? stats.currentCgpa.toFixed(2) : '—',
      icon: TrendingUp,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-glow)',
      good: stats.currentCgpa !== null && stats.currentCgpa >= 3.0,
    },
    {
      label: 'Avg. Attendance',
      value: `${stats.avgAttendance}%`,
      icon: Percent,
      color: stats.avgAttendance >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
      bg: stats.avgAttendance >= 75 ? 'var(--accent-emerald-glow)' : 'var(--accent-rose-glow)',
      good: stats.avgAttendance >= 75,
    },
    {
      label: 'Pending Deadlines',
      value: stats.upcomingDeadlines,
      icon: Clock,
      color: stats.upcomingDeadlines > 3 ? 'var(--accent-rose)' : 'var(--accent-amber)',
      bg: stats.upcomingDeadlines > 3 ? 'var(--accent-rose-glow)' : 'var(--accent-amber-glow)',
      good: stats.upcomingDeadlines <= 3,
    },
    {
      label: 'Credits Completed',
      value: Number.isInteger(stats.creditsCompleted) ? stats.creditsCompleted : stats.creditsCompleted.toFixed(1),
      icon: BookOpen,
      color: 'var(--accent-purple)',
      bg: 'var(--accent-purple-glow)',
      good: true,
    },
  ];

  return (
    <div className="dashboard-quick-stats">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="quick-stat-card glass-card-static">
            <div className="quick-stat-icon" style={{ background: item.bg, color: item.color }}>
              <Icon size={16} />
            </div>
            <div className="quick-stat-body">
              <span className="quick-stat-value" style={{ color: item.color }}>{item.value}</span>
              <span className="quick-stat-label">{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="dashboard-header-section">
        <h1 className="page-title">Command Center</h1>
        <p className="page-description">Your academic day at a glance — stay on track, stay focused.</p>
      </div>

      <QuickStats />
      <NotificationBanner />
      <WeeklyPlanner />

      {/* 14-Week Schedule */}
      <WeekSchedule />

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <RoutineCard />
          <RoutineAttendanceTracker />
        </div>

        <div className="dashboard-side-col">
          <DeadlineTicker />
          <NoticeBoard />
        </div>
      </div>
    </div>
  );
}
