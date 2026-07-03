import { useState, useMemo } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, BookOpen, PenLine, Save, Trash2 } from 'lucide-react';
import './ExamTracker.css';

const STORAGE_KEY = 'aust-exam-tracker';

const EXAM_SLOTS = [
  { key: 'quiz1', label: 'Quiz 1', icon: '📝' },
  { key: 'quiz2', label: 'Quiz 2', icon: '📝' },
  { key: 'quiz3', label: 'Quiz 3', icon: '📝' },
  { key: 'mid', label: 'Mid', icon: '📋' },
  { key: 'final', label: 'Semester Final', icon: '🎯' },
];

export default function ExamTracker() {
  const { routine } = useRoutine();
  const { user } = useAuth();
  const [examData, setExamData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editDates, setEditDates] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'cr' || user?.role === 'sr';

  const theoryCourses = useMemo(() => {
    const courses = [];
    const seen = new Set();
    Object.values(routine || {}).forEach((dayClasses) => {
      (dayClasses || []).forEach((cls) => {
        if (cls.type === 'Theory' && cls.course && !seen.has(cls.course)) {
          seen.add(cls.course);
          courses.push({
            code: cls.course,
            name: cls.name || cls.course,
            color: cls.color || 'var(--accent-blue)',
          });
        }
      });
    });
    return courses;
  }, [routine]);

  const handleEdit = (course) => {
    setEditingCourse(course.code);
    setEditDates(
      EXAM_SLOTS.reduce((acc, slot) => {
        acc[slot.key] = examData[course.code]?.[slot.key] || '';
        return acc;
      }, {})
    );
  };

  const handleSave = (courseCode) => {
    setIsSaving(true);
    const updated = {
      ...examData,
      [courseCode]: { ...editDates },
    };
    setExamData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingCourse(null);
    setEditDates({});
    setTimeout(() => setIsSaving(false), 300);
  };

  const handleClear = (courseCode) => {
    const updated = { ...examData };
    delete updated[courseCode];
    setExamData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingCourse(null);
    setEditDates({});
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (dateStr) => {
    const days = getDaysRemaining(dateStr);
    if (days === null || days === undefined) return { text: 'Not set', cls: 'badge-neutral' };
    if (days < 0) return { text: `Passed (${Math.abs(days)}d)`, cls: 'badge-rose' };
    if (days === 0) return { text: 'Today', cls: 'badge-rose' };
    if (days <= 3) return { text: `${days}d left`, cls: 'badge-amber' };
    if (days <= 7) return { text: `${days}d left`, cls: 'badge-blue' };
    return { text: `${days}d left`, cls: 'badge-emerald' };
  };

  if (theoryCourses.length === 0) {
    return (
      <div className="exam-tracker glass-card-static animate-fadeIn">
        <div className="exam-tracker-header">
          <div className="exam-tracker-title-row">
            <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '6px', borderRadius: '8px' }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Exam Tracker</h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>Quiz, Mid & Final dates</p>
            </div>
          </div>
        </div>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <BookOpen size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No theory courses in routine</p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>Add theory courses to your routine to see exam tracker</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-tracker glass-card-static animate-fadeIn">
      <div className="exam-tracker-header">
        <div className="exam-tracker-title-row">
          <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '6px', borderRadius: '8px' }}>
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Exam Tracker</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>Quiz, Mid & Final dates</p>
          </div>
        </div>
        <span className="badge badge-amber" style={{ fontSize: '10px' }}>
          {theoryCourses.length} Course{theoryCourses.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="exam-courses-list">
        {theoryCourses.map((course) => {
          const courseExams = examData[course.code] || {};
          const isEditing = editingCourse === course.code;

          return (
            <div key={course.code} className="exam-course-card">
              <div className="exam-course-header">
                <div className="exam-course-info">
                  <span className="exam-course-code" style={{ color: course.color }}>{course.code}</span>
                  <span className="exam-course-name">{course.name}</span>
                </div>
                {canEdit && !isEditing && (
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => handleEdit(course)} aria-label="Edit exams">
                    <PenLine size={14} />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="exam-edit-form">
                  <div className="exam-slots-edit">
                    {EXAM_SLOTS.map((slot) => (
                      <div key={slot.key} className="exam-slot-edit">
                        <label className="exam-slot-label">
                          <span>{slot.icon}</span>
                          <span>{slot.label}</span>
                        </label>
                        <input
                          type="date"
                          value={editDates[slot.key] || ''}
                          onChange={(e) => setEditDates((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                          className="input exam-date-input"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="exam-edit-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingCourse(null)}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSave(course.code)}
                      disabled={isSaving}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Save size={14} />
                      {isSaving ? 'Saved!' : 'Save'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleClear(course.code)}
                      style={{ color: 'var(--accent-rose)' }}
                      aria-label="Clear all dates"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="exam-slots-display">
                  {EXAM_SLOTS.map((slot) => {
                    const dateVal = courseExams[slot.key];
                    const badge = getStatusBadge(dateVal);
                    return (
                      <div key={slot.key} className="exam-slot-display">
                        <div className="exam-slot-header">
                          <span className="exam-slot-icon">{slot.icon}</span>
                          <span className="exam-slot-label-text">{slot.label}</span>
                        </div>
                        <div className="exam-slot-date">
                          <span className={`badge ${badge.cls}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                            {badge.text}
                          </span>
                          <span className="exam-date-text">{formatDate(dateVal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
