import { useState, useMemo } from 'react';
import { useRoutine } from '../../context/RoutineContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, PenLine, X, Check } from 'lucide-react';
import './ExamTracker.css';

const STORAGE_KEY = 'aust-exam-tracker';

const EXAM_SLOTS = [
  { key: 'quiz1', label: 'Quiz 1', color: 'var(--accent-blue)', glow: 'var(--accent-blue-glow)' },
  { key: 'quiz2', label: 'Quiz 2', color: 'var(--accent-orange)', glow: 'var(--accent-orange-glow)' },
  { key: 'quiz3', label: 'Quiz 3', color: 'var(--accent-purple)', glow: 'var(--accent-purple-glow)' },
  { key: 'quiz4', label: 'Quiz 4', color: 'var(--accent-emerald)', glow: 'var(--accent-emerald-glow)' },
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SlotCard({ slot, slotData, onViewDetails, courseCode, courseName }) {
  const state = getSlotState(slotData?.date);

  const handleClick = () => onViewDetails(slot.key, slot.label, slotData?.date, slotData?.syllabus, courseCode, courseName);

  return (
    <div
      className="exam-slot"
      style={{ '--slot-clr': slot.color }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      <div className="exam-slot-header">
        <span className="exam-slot-name">{slot.label}</span>
        <span className={`exam-slot-state ${state.cls}`}>{state.label}</span>
      </div>
      <div className="exam-slot-display">
        <span className="exam-slot-date">{formatDate(slotData?.date)}</span>
      </div>
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
  const [detailModal, setDetailModal] = useState(null); // { slotKey, slotLabel, date, syllabus, courseCode, courseName, isEditing, editDate, editSyllabus }

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

  const openDetails = (slotKey, slotLabel, date, syllabus, courseCode, courseName) => {
    setDetailModal({ slotKey, slotLabel, date, syllabus, courseCode, courseName, isEditing: false, editDate: date || '', editSyllabus: syllabus || '' });
  };

  const handleSaveSingleSlot = () => {
    if (!detailModal) return;
    const { courseCode, slotKey, editDate, editSyllabus } = detailModal;
    const updated = { ...examData };
    if (!updated[courseCode]) updated[courseCode] = {};
    updated[courseCode][slotKey] = {
      date: editDate || '',
      syllabus: editSyllabus || ''
    };
    setExamData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDetailModal(null);
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
      {/* ─── Detail Overlay ─── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%', padding: '24px', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-blue)', fontWeight: 'var(--fw-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{detailModal.slotLabel}</span>
                <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)', margin: '4px 0 0' }}>{detailModal.courseCode}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{detailModal.courseName}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {canEdit && !detailModal.isEditing && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDetailModal(prev => ({ ...prev, isEditing: true }))}
                  >
                    <PenLine size={12} /> Edit
                  </button>
                )}
                {canEdit && detailModal.isEditing && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveSingleSlot}
                  >
                    <Check size={13} /> Done
                  </button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={() => setDetailModal(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {detailModal.isEditing ? (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</span>
                  <input
                    type="date"
                    value={detailModal.editDate || ''}
                    onChange={(e) => setDetailModal(prev => ({ ...prev, editDate: e.target.value }))}
                    style={{
                      width: '100%', height: '38px', padding: '6px 12px', fontSize: 'var(--fs-sm)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Syllabus</span>
                  <textarea
                    value={detailModal.editSyllabus || ''}
                    onChange={(e) => setDetailModal(prev => ({ ...prev, editSyllabus: e.target.value }))}
                    placeholder="Syllabus topics, chapters, page numbers..."
                    rows={6}
                    style={{
                      width: '100%', padding: '10px 12px', fontSize: 'var(--fs-sm)', lineHeight: '1.6',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)', color: 'var(--text-primary)', resize: 'vertical',
                      fontFamily: 'inherit', outline: 'none'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Date</span>
                  <span style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)', color: 'var(--text-primary)' }}>{formatDate(detailModal.date)}</span>
                </div>
                {detailModal.syllabus ? (
                  <div>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Syllabus</span>
                    <div style={{ fontSize: 'var(--fs-base)', lineHeight: '1.7', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                      {detailModal.syllabus}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
                    No syllabus added yet
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {theoryCourses.map((course) => {
        const courseExams = examData[course.code] || {};

        return (
          <div key={course.code} className="exam-course-card">
            <div className="exam-course-header">
              <div className="exam-course-title">
                <span className="exam-course-code" style={{ color: course.color }}>{course.code}</span>
                <span className="exam-course-name">{course.name}</span>
              </div>
            </div>

            <div className="exam-slots-grid">
              {EXAM_SLOTS.map((slot) => {
                const slotData = courseExams[slot.key];
                return (
                  <SlotCard
                    key={slot.key}
                    slot={slot}
                    slotData={slotData}
                    onViewDetails={openDetails}
                    courseCode={course.code}
                    courseName={course.name}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
