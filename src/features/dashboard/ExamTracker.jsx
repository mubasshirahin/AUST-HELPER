import { useState, useMemo, useRef } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, BookOpen, PenLine, Save, Trash2 } from 'lucide-react';
import './ExamTracker.css';

const STORAGE_KEY = 'aust-exam-tracker';

const EXAM_SLOTS = [
  { key: 'quiz1', label: 'Quiz 1' },
  { key: 'quiz2', label: 'Quiz 2' },
  { key: 'quiz3', label: 'Quiz 3' },
  { key: 'mid', label: 'Mid' },
  { key: 'final', label: 'Final' },
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
  const inputRefs = useRef({});

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

  const handleKeyDown = (e, idx, total) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (idx + 1 < total) inputRefs.current[`exam_${idx + 1}`]?.focus();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (idx - 1 >= 0) inputRefs.current[`exam_${idx - 1}`]?.focus();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const getSlotState = (dateStr) => {
    const days = getDaysRemaining(dateStr);
    if (days === null) return { text: '—', cls: 'neutral' };
    if (days < 0) return { text: `Passed`, cls: 'rose' };
    if (days === 0) return { text: 'Today!', cls: 'rose' };
    if (days <= 3) return { text: `${days}d`, cls: 'amber' };
    if (days <= 7) return { text: `${days}d`, cls: 'blue' };
    return { text: `${days}d`, cls: 'emerald' };
  };

  if (theoryCourses.length === 0) {
    return (
      <div className="exam-tracker animate-fadeIn">
        <div className="exam-tracker-header">
          <div className="exam-tracker-title-row">
            <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '8px', borderRadius: '10px' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="section-title" style={{ margin: 0 }}>Exam Tracker</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', margin: 0 }}>Quiz, Mid & Final dates</p>
            </div>
          </div>
        </div>
        <div className="empty-state" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>No theory courses</p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Add theory courses to your routine first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-tracker animate-fadeIn">
      <div className="exam-tracker-header">
        <div className="exam-tracker-title-row">
          <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '8px', borderRadius: '10px' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Exam Tracker</h3>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', margin: 0 }}>Quiz, Mid & Final dates</p>
          </div>
        </div>
        <span className="badge badge-amber" style={{ fontSize: '10px', padding: '4px 10px' }}>
          {theoryCourses.length} Course{theoryCourses.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="exam-table-wrap">
        <table className="exam-table">
          <thead>
            <tr>
              <th className="exam-th-course">Course</th>
              {EXAM_SLOTS.map((slot) => (
                <th key={slot.key} className="exam-th-slot">{slot.label}</th>
              ))}
              <th className="exam-th-action"></th>
            </tr>
          </thead>
          <tbody>
            {theoryCourses.map((course) => {
              const courseExams = examData[course.code] || {};
              const isEditing = editingCourse === course.code;

              if (isEditing) {
                return (
                  <tr key={course.code} className="exam-tr-editing">
                    <td className="exam-td-course">
                      <span className="exam-course-code" style={{ color: course.color }}>{course.code}</span>
                    </td>
                    {EXAM_SLOTS.map((slot, si) => (
                      <td key={slot.key} className="exam-td-edit">
                        <input
                          ref={el => inputRefs.current[`exam_${si}`] = el}
                          type="date"
                          value={editDates[slot.key] || ''}
                          onChange={(e) => setEditDates((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                          className="input exam-date-input"
                          onKeyDown={e => handleKeyDown(e, si, EXAM_SLOTS.length)}
                        />
                      </td>
                    ))}
                    <td className="exam-td-action">
                      <div className="exam-edit-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleSave(course.code)} disabled={isSaving}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '11px' }}>
                          <Save size={12} />
                          {isSaving ? 'Saved' : 'Save'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingCourse(null)}
                          style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Cancel
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleClear(course.code)}
                          style={{ color: 'var(--accent-rose)', padding: '4px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={course.code} className="exam-tr">
                  <td className="exam-td-course">
                    <div className="exam-course-info">
                      <span className="exam-course-code" style={{ color: course.color }}>{course.code}</span>
                      <span className="exam-course-name">{course.name}</span>
                    </div>
                  </td>
                  {EXAM_SLOTS.map((slot) => {
                    const dateVal = courseExams[slot.key];
                    const state = getSlotState(dateVal);
                    return (
                      <td key={slot.key} className="exam-td-slot">
                        <div className="exam-cell-content">
                          <span className="exam-cell-date">{formatDate(dateVal)}</span>
                          <span className={`exam-badge ${state.cls}`}>{state.text}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="exam-td-action">
                    {canEdit && (
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => handleEdit(course)} aria-label="Edit"
                        style={{ borderRadius: '6px' }}>
                        <PenLine size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}