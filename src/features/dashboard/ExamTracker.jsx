import { useState, useMemo } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, PenLine, Save, ChevronDown, FileText } from 'lucide-react';
import './ExamTracker.css';

const STORAGE_KEY = 'aust-exam-tracker';

const EXAM_SLOTS = [
  { key: 'quiz1', label: 'Quiz 1', color: 'var(--accent-blue)', glow: 'var(--accent-blue-glow)' },
  { key: 'quiz2', label: 'Quiz 2', color: 'var(--accent-orange)', glow: 'var(--accent-orange-glow)' },
  { key: 'quiz3', label: 'Quiz 3', color: 'var(--accent-purple)', glow: 'var(--accent-purple-glow)' },
  { key: 'mid', label: 'Mid', color: 'var(--accent-amber)', glow: 'var(--accent-amber-glow)' },
  { key: 'final', label: 'Final', color: 'var(--accent-rose)', glow: 'var(--accent-rose-glow)' },
];

function getSlotState(dateStr) {
  if (!dateStr) return { label: '\u2014', cls: 'neutral' };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Passed', cls: 'passed' };
  if (diff === 0) return { label: 'Today', cls: 'today' };
  if (diff <= 3) return { label: `${diff}d`, cls: 'urgent' };
  if (diff <= 7) return { label: `${diff}d`, cls: 'soon' };
  return { label: `${diff}d`, cls: 'normal' };
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SlotCard({ slot, slotData, isEditing, editDate, editSyllabus, onDateChange, onSyllabusChange, isExpanded, onToggle, courseCode }) {
  const state = getSlotState(slotData?.date);
  const getDaysRemaining = () => {
    if (!slotData?.date) return null;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const target = new Date(slotData.date); target.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };
  const daysLeft = getDaysRemaining();
  const showRing = daysLeft !== null && daysLeft > 0 && daysLeft <= 14;
  const ringProgress = showRing ? Math.max(0, Math.min(100, ((14 - daysLeft) / 14) * 100)) : 0;

  return (
    <div className="exam-slot" style={{ '--slot-clr': slot.color }}>
      <div className="exam-slot-header">
        <span className="exam-slot-name">{slot.label}</span>
        {!isEditing && (
          <div className="exam-slot-state-row">
            {showRing && (
              <svg className="exam-countdown-ring" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-primary)" strokeWidth="2" />
                <circle
                  cx="12" cy="12" r="10" fill="none"
                  stroke={state.cls === 'urgent' ? 'var(--accent-rose)' : state.cls === 'soon' ? 'var(--accent-amber)' : slot.color}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - ringProgress / 100)}`}
                  transform="rotate(-90 12 12)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
            )}
            <span className={`exam-slot-state ${state.cls}`}>{state.label}</span>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="exam-slot-edit">
          <input
            type="date"
            value={editDate || ''}
            onChange={(e) => onDateChange(slot.key, e.target.value)}
            className="exam-slot-date-input"
          />
          <textarea
            value={editSyllabus || ''}
            onChange={(e) => onSyllabusChange(slot.key, e.target.value)}
            className="exam-slot-syllabus-input"
            placeholder="Syllabus topics, chapters, page numbers..."
            rows={4}
            style={{ minHeight: '72px', padding: '8px 10px', fontSize: '11px' }}
          />
        </div>
      ) : (
        <div className="exam-slot-display">
          <span className="exam-slot-date">{formatDate(slotData?.date)}</span>
          {slotData?.syllabus && (
            <div
              className={`exam-slot-syllabus ${isExpanded ? 'expanded' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(courseCode, slot.key)}
              onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); onToggle(courseCode, slot.key); } }}
            >
              <div className="exam-slot-syllabus-header">
                <FileText size={11} />
                <span>Syllabus</span>
                <ChevronDown size={11} className={`exam-slot-chevron ${isExpanded ? 'open' : ''}`} />
              </div>
              {isExpanded && (
                <div className="exam-slot-syllabus-body">
                  {slotData.syllabus}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamTracker() {
  const { routine } = useRoutine();
  const { user } = useAuth();
  const [examData, setExamData] = useState(() => {
    try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) : {}; }
    catch { return {}; }
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editDates, setEditDates] = useState({});
  const [editSyllabus, setEditSyllabus] = useState({});
  const [expandedSlots, setExpandedSlots] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'cr' || user?.role === 'sr';

  const theoryCourses = useMemo(() => {
    const courses = []; const seen = new Set();
    Object.values(routine || {}).forEach((dayClasses) => {
      (dayClasses || []).forEach((cls) => {
        if (cls.type === 'Theory' && cls.course && !seen.has(cls.course)) {
          seen.add(cls.course);
          courses.push({ code: cls.course, name: cls.name || cls.course, color: cls.color || 'var(--accent-blue)' });
        }
      });
    });
    return courses;
  }, [routine]);

  const handleEdit = (course) => {
    setEditingCourse(course.code);
    const courseData = examData[course.code] || {};
    const dates = {}; const syllabus = {};
    EXAM_SLOTS.forEach(slot => {
      dates[slot.key] = courseData[slot.key]?.date || '';
      syllabus[slot.key] = courseData[slot.key]?.syllabus || '';
    });
    setEditDates(dates);
    setEditSyllabus(syllabus);
  };

  const handleSave = (courseCode) => {
    setIsSaving(true);
    const courseData = examData[courseCode] || {};
    const updated = { ...examData, [courseCode]: {} };
    EXAM_SLOTS.forEach(slot => {
      updated[courseCode][slot.key] = {
        date: editDates[slot.key] || courseData[slot.key]?.date || '',
        syllabus: editSyllabus[slot.key] || courseData[slot.key]?.syllabus || ''
      };
    });
    setExamData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingCourse(null);
    setTimeout(() => setIsSaving(false), 300);
  };

  const toggleSyllabus = (courseCode, slotKey) => {
    setExpandedSlots(prev => ({ ...prev, [`${courseCode}-${slotKey}`]: !prev[`${courseCode}-${slotKey}`] }));
  };

  if (theoryCourses.length === 0) {
    return (
      <div className="exam-tracker animate-fadeIn">
        <div className="exam-empty">
          <BookOpen size={24} style={{ opacity: 0.3 }} />
          <p>No theory courses found</p>
          <span>Add theory courses to your routine first</span>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-tracker animate-fadeIn">
      {theoryCourses.map((course) => {
        const courseExams = examData[course.code] || {};
        const isEditing = editingCourse === course.code;

        return (
          <div key={course.code} className={`exam-course-card${isEditing ? ' editing' : ''}`}>
            <div className="exam-course-header">
              <div className="exam-course-title">
                <span className="exam-course-code" style={{ color: course.color }}>{course.code}</span>
                <span className="exam-course-name">{course.name}</span>
              </div>
              {canEdit && !isEditing && (
                <button className="exam-edit-trigger" onClick={() => handleEdit(course)} aria-label="Edit exams">
                  <PenLine size={13} />
                </button>
              )}
            </div>

            <div className="exam-slots-grid">
              {EXAM_SLOTS.map((slot) => {
                const slotData = courseExams[slot.key];
                return (
                  <SlotCard
                    key={slot.key}
                    slot={slot}
                    slotData={slotData}
                    isEditing={isEditing}
                    editDate={editDates[slot.key]}
                    editSyllabus={editSyllabus[slot.key]}
                    onDateChange={(key, val) => setEditDates(prev => ({ ...prev, [key]: val }))}
                    onSyllabusChange={(key, val) => setEditSyllabus(prev => ({ ...prev, [key]: val }))}
                    isExpanded={expandedSlots[`${course.code}-${slot.key}`]}
                    onToggle={toggleSyllabus}
                    courseCode={course.code}
                  />
                );
              })}
            </div>

            {isEditing && (
              <div className="exam-edit-actions-bar">
                <button className="exam-save-btn" onClick={() => handleSave(course.code)} disabled={isSaving}>
                  <Save size={13} /> {isSaving ? 'Saved' : 'Save'}
                </button>
                <button className="exam-cancel-btn" onClick={() => setEditingCourse(null)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
