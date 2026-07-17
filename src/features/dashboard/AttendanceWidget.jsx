import { useState, useMemo, useCallback } from 'react';
import { Percent, AlertTriangle, ShieldCheck, TrendingUp, ChevronLeft, X, CheckCircle, XCircle } from 'lucide-react';
import { routineData } from '../../data/mockData';
import { normalizeAccentColor } from '../../utils/colorPalette';
import { generateSemesterDates, getSemesterStartDate } from '../../utils/semesterDates';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'aust-attendance-records';

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Derive unique course list from routineData with their class days
function buildCourseList() {
  const map = {};
  Object.entries(routineData).forEach(([day, slots]) => {
    slots.forEach(slot => {
      if (!map[slot.course]) {
        map[slot.course] = {
          code: slot.course,
          name: slot.name,
          color: slot.color,
          classDays: [],
        };
      }
      if (!map[slot.course].classDays.includes(day)) {
        map[slot.course].classDays.push(day);
      }
    });
  });
  return Object.values(map);
}

// ---------------------------------------------------------------------------
// Sub-component: Course Detail View
// ---------------------------------------------------------------------------

function CourseDetail({ course, semesterStart, records, onToggle, onBack }) {
  const sessions = useMemo(
    () => generateSemesterDates(semesterStart, course.classDays),
    [semesterStart, course.classDays]
  );

  const attended = sessions.filter(s => records[s.id] === true).length;
  const total = sessions.length;
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
  const accentColor = normalizeAccentColor(course.color);

  // How many more absences are allowed before dropping below 75%
  // attended / (total) >= 0.75  →  attended >= 0.75 * total
  // safe to miss = floor((attended - 0.75*total) / 0.75)  when positive
  const safeToMiss = Math.max(0, Math.floor((attended - 0.75 * total) / 0.75));

  // Group sessions by week for a cleaner display
  const byWeek = useMemo(() => {
    const groups = {};
    sessions.forEach(s => {
      if (!groups[s.weekNum]) groups[s.weekNum] = [];
      groups[s.weekNum].push(s);
    });
    return groups;
  }, [sessions]);

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px',
          }}
        >
          <ChevronLeft size={13} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {course.code}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {course.name}
          </div>
        </div>
        <div style={{
          fontSize: '13px', fontWeight: '800',
          color: percentage >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          flexShrink: 0,
        }}>
          {percentage}%
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: '8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '10px 12px',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Attended', value: attended, color: 'var(--accent-emerald)' },
          { label: 'Absent', value: total - attended, color: 'var(--accent-rose)' },
          { label: 'Total', value: total, color: 'var(--text-secondary)' },
          { label: 'Safe to Miss', value: safeToMiss, color: safeToMiss === 0 ? 'var(--accent-rose)' : safeToMiss <= 2 ? 'var(--accent-amber)' : 'var(--accent-emerald)' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, minWidth: '50px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(percentage, 100)}%`,
          borderRadius: '4px',
          background: percentage >= 75
            ? `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`
            : 'linear-gradient(90deg, var(--accent-rose), rgba(251,113,133,0.7))',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Session list grouped by week */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
        {Object.entries(byWeek).map(([weekNum, weekSessions]) => (
          <div key={weekNum}>
            <div style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
              Week {weekNum}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {weekSessions.map(session => {
                const isPresent = records[session.id] === true;
                const isMarked = session.id in records;
                return (
                  <button
                    key={session.id}
                    onClick={() => onToggle(session.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isPresent
                        ? 'rgba(52,211,153,0.25)'
                        : isMarked
                          ? 'rgba(251,113,133,0.25)'
                          : 'rgba(255,255,255,0.07)',
                      background: isPresent
                        ? 'rgba(52,211,153,0.08)'
                        : isMarked
                          ? 'rgba(251,113,133,0.08)'
                          : 'rgba(255,255,255,0.025)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {formatDate(session.date)}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                        {session.dayName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      {isPresent ? (
                        <><CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} /><span style={{ fontSize: '9px', color: 'var(--accent-emerald)', fontWeight: '700' }}>PRESENT</span></>
                      ) : isMarked ? (
                        <><XCircle size={14} style={{ color: 'var(--accent-rose)' }} /><span style={{ fontSize: '9px', color: 'var(--accent-rose)', fontWeight: '700' }}>ABSENT</span></>
                      ) : (
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>Tap to mark</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-tertiary)', fontSize: '11px' }}>
          No class dates generated — check semester start date in Schedule settings.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AttendanceWidget() {
  const [records, setRecords] = useState(loadRecords);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const semesterStart = getSemesterStartDate();
  const courses = useMemo(buildCourseList, []);

  // Per-course stats derived from records + generated dates
  const courseStats = useMemo(() => {
    return courses.map(course => {
      const sessions = generateSemesterDates(semesterStart, course.classDays);
      const total = sessions.length;
      const attended = sessions.filter(s => records[s.id] === true).length;
      const percentage = total > 0 ? (attended / total) * 100 : 0;
      const safeToMiss = Math.max(0, Math.floor((attended - 0.75 * total) / 0.75));
      return { ...course, sessions, total, attended, percentage: parseFloat(percentage.toFixed(1)), safeToMiss };
    });
  }, [courses, records, semesterStart]);

  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    let warningCount = 0;
    courseStats.forEach(c => {
      totalAttended += c.attended;
      totalClasses += c.total;
      if (c.total > 0 && c.percentage < 75) warningCount++;
    });
    const average = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(1)) : 0;
    return { average, warningCount };
  }, [courseStats]);

  const isHealthy = overallStats.average >= 75;

  const dialOffset = useMemo(() => {
    const r = 26;
    const circ = 2 * Math.PI * r;
    return circ - (overallStats.average / 100) * circ;
  }, [overallStats.average]);

  const handleToggle = useCallback((sessionId) => {
    setRecords(prev => {
      const next = { ...prev };
      // Cycle: unmarked → present → absent → unmarked
      if (!(sessionId in next)) {
        next[sessionId] = true;
      } else if (next[sessionId] === true) {
        next[sessionId] = false;
      } else {
        delete next[sessionId];
      }
      saveRecords(next);
      return next;
    });
  }, []);

  const activeCourseStats = selectedCourse
    ? courseStats.find(c => c.code === selectedCourse.code)
    : null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '120px', height: '120px',
        background: isHealthy
          ? 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.08))',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-purple)',
            flexShrink: 0,
          }}>
            <Percent size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Attendance</div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '1px' }}>Safe-to-miss tracker</div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px', fontWeight: '600',
          letterSpacing: '0.02em',
          background: isHealthy ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
          border: `1px solid ${isHealthy ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
          color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)',
        }}>
          {isHealthy
            ? <><ShieldCheck size={11} /> Safe</>
            : <><AlertTriangle size={11} /> {overallStats.warningCount} At Risk</>
          }
        </div>
      </div>

      {/* Body: course detail view or overview */}
      {selectedCourse ? (
        <CourseDetail
          course={activeCourseStats}
          semesterStart={semesterStart}
          records={records}
          onToggle={handleToggle}
          onBack={() => setSelectedCourse(null)}
        />
      ) : (
        <>
          {/* Overall dial */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            padding: '12px 14px',
          }}>
            <div style={{ flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke={isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={dialOffset}
                  transform="rotate(-90 32 32)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 4px ${isHealthy ? 'rgba(52,211,153,0.5)' : 'rgba(251,113,133,0.5)'})` }}
                />
                <text x="32" y="36" textAnchor="middle"
                  style={{ fill: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '12px', fontWeight: '700' }}>
                  {overallStats.average}%
                </text>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Overall Average
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} style={{ color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {isHealthy
                    ? 'Above minimum threshold'
                    : `${overallStats.warningCount} course${overallStats.warningCount > 1 ? 's' : ''} below 75%`}
                </span>
              </div>
            </div>
          </div>

          {/* Course list */}
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
              <Percent size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ margin: 0 }}>No courses in routine data</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {courseStats.map(item => {
                const isDanger = item.total > 0 && item.percentage < 75;
                const accentColor = normalizeAccentColor(item.color);
                const badgeStyle = item.safeToMiss === 0
                  ? { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.3)', color: 'var(--accent-rose)' }
                  : item.safeToMiss <= 2
                  ? { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', color: 'var(--accent-amber)' }
                  : { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', color: 'var(--accent-emerald)' };

                return (
                  <button
                    key={item.code}
                    onClick={() => setSelectedCourse(item)}
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                      width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: '600',
                        color: 'var(--text-primary)', letterSpacing: '-0.01em',
                        maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{item.code}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: isDanger ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: '500' }}>
                          {item.attended}/{item.total} · {parseInt(item.percentage)}%
                        </span>
                        <span style={{
                          fontSize: '9px', fontWeight: '700',
                          padding: '2px 7px', borderRadius: '10px',
                          background: badgeStyle.bg,
                          border: `1px solid ${badgeStyle.border}`,
                          color: badgeStyle.color,
                          letterSpacing: '0.02em',
                        }}>
                          {item.safeToMiss} left
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(item.percentage, 100)}%`,
                        borderRadius: '4px',
                        background: isDanger
                          ? 'linear-gradient(90deg, var(--accent-rose), rgba(251,113,133,0.7))'
                          : `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
                        boxShadow: isDanger ? '0 0 6px rgba(251,113,133,0.4)' : `0 0 6px ${accentColor}66`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
