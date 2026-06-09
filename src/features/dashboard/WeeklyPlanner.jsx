import React, { useState } from 'react';
import { CalendarDays, Trash2, X, Download, Eye, Check, RotateCcw } from 'lucide-react';
import { useRoutine } from '../../context/RoutineContext';
import { ocrImportedRoutine, ocrImportedWeekDays } from '../../context/RoutineContext';
import { normalizeAccentColor } from '../../utils/colorPalette';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import { findCourseByCode, findCourseByName } from '../../data/courses';
import { getAutoColorForCourse } from '../../utils/autoColorPalette';
import { loadTemplates } from '../../utils/routineTemplates';

export default function WeeklyPlanner() {
  const { routine, weekDays, updateRoutineClass, addRoutineClass, deleteRoutineClass, replaceRoutine } = useRoutine();
  const [editing, setEditing] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);

  // Time slot columns matching the AUST schedule exactly
  const timeSlots = [
    { label: '08:00 AM - 08:50 AM', display: '08:00-08:50' },
    { label: '08:50 AM - 09:40 AM', display: '08:50-09:40' },
    { label: '09:40 AM - 10:30 AM', display: '09:40-10:30' },
    { label: '10:30 AM - 11:20 AM', display: '10:30-11:20' },
    { label: '11:20 AM - 12:10 PM', display: '11:20-12:10' },
    { label: '12:10 PM - 01:00 PM', display: '12:10-01:00' },
    { label: '01:00 PM - 01:50 PM', display: '01:00-01:50' },
    { label: '01:50 PM - 02:40 PM', display: '01:50-02:40' },
    { label: '02:40 PM - 03:30 PM', display: '02:40-03:30' },
    { label: '03:30 PM - 04:20 PM', display: '03:30-04:20' },
    { label: '04:20 PM - 05:10 PM', display: '04:20-05:10' },
    { label: '05:10 PM - 06:00 PM', display: '05:10-06:00' },
  ];

  const slotBoundaries = [
    '08:00', '08:50', '09:40', '10:30', '11:20', '12:10',
    '13:00', '13:50', '14:40', '15:30', '16:20', '17:10', '18:00',
  ];

  const normalizeTime = (value) => {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = match[2];
    const period = match[3]?.toLowerCase();

    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    if (!period && hour >= 1 && hour <= 6) hour += 12;

    return `${String(hour).padStart(2, '0')}:${minute}`;
  };

  // Calculate end time based on start time and number of periods
  const calculateEndTime = (startTime, periods) => {
    const start = normalizeTime(startTime.trim());
    if (!start) return '08:50';
    
    const startIdx = slotBoundaries.indexOf(start);
    if (startIdx === -1) return '08:50';
    
    const endIdx = Math.min(startIdx + periods, slotBoundaries.length - 1);
    return slotBoundaries[endIdx];
  };

  const formatTimeForDisplay = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
    return `${String(hour12).padStart(2, '0')}:${minute} ${ampm}`;
  };

  const emptyForm = {
    course: '',
    name: '',
    type: 'Theory',
    time: '08:00 - 08:50',
    room: '',
    teacher: 'TBA',
    color: getAutoColorForCourse('', 'Theory'), // Auto-assign default CSE theory color
  };

  const getSlotDetails = (timeStr) => {
    const [rawStart, rawEnd] = timeStr.split('-');
    const start = normalizeTime(rawStart || '');
    const end = normalizeTime(rawEnd || '');

    let startIdx = slotBoundaries.indexOf(start);
    let endIdx = slotBoundaries.indexOf(end);

    // Some default/demo classes start between official AUST slot boundaries.
    // Place them in the nearest visible table slot instead of dropping them.
    if (startIdx === -1 && start) {
      startIdx = slotBoundaries.findIndex((slot) => slot > start) - 1;
    }
    if (endIdx === -1 && end) {
      endIdx = slotBoundaries.findIndex((slot) => slot >= end);
    }

    if (startIdx < 0) startIdx = 0;
    if (endIdx <= startIdx) endIdx = startIdx + 1;

    const colSpan = Math.min(timeSlots.length - startIdx, Math.max(1, endIdx - startIdx));

    return { startIdx, colSpan };
  };

  const openAddModal = (day = weekDays[0] || 'Sunday', slotIdx = 0) => {
    const start = slotBoundaries[slotIdx] || '08:00';
    const end = slotBoundaries[slotIdx + 1] || '08:50';

    setEditing({
      mode: 'add',
      day,
      form: {
        ...emptyForm,
        time: `${start} - ${end}`,
      },
    });
  };

  const openEditModal = (day, cls) => {
    setEditing({
      mode: 'edit',
      originalDay: day,
      day,
      form: { ...cls },
    });
  };

  const updateForm = (field, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
      },
    }));
  };

  const saveEdit = (event) => {
    event.preventDefault();
    const cleanClass = {
      ...editing.form,
      course: editing.form.course.trim() || 'Untitled',
      name: editing.form.name.trim() || 'Class',
      room: editing.form.room.trim() || 'TBA',
      teacher: editing.form.teacher.trim() || 'TBA',
      time: editing.form.time.trim() || '08:00 - 08:50',
    };

    if (editing.mode === 'add') {
      addRoutineClass(editing.day, cleanClass);
    } else {
      updateRoutineClass(editing.originalDay, { ...cleanClass, day: editing.day });
    }

    setEditing(null);
  };

  const removeClass = () => {
    deleteRoutineClass(editing.originalDay, editing.form.id);
    setEditing(null);
  };

  const openLoadModal = () => {
    const templates = loadTemplates();
    setAvailableTemplates(templates);
    setSelectedTemplate(null);
    setShowLoadModal(true);
  };

  const handleLoadTemplate = () => {
    if (selectedTemplate) {
      replaceRoutine(selectedTemplate.routine, selectedTemplate.weekDays);
      setShowLoadModal(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="glass-card-static weekly-planner animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', padding: '6px', borderRadius: '8px' }}>
            <CalendarDays size={18} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Class Schedule Table</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Traditional AUST timetable overview (SUN-THU)</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-danger btn-sm" onClick={() => {
            const emptyRoutine = {
              Sunday: [],
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
            };
            const emptyWeekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
            replaceRoutine(emptyRoutine, emptyWeekDays);
          }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-secondary btn-sm" onClick={openLoadModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Load Routine
          </button>
        </div>
      </div>

      <div className="weekly-table-wrap">
        <table 
          className="weekly-table"
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            textAlign: 'center',
            tableLayout: 'fixed',
            border: '1px solid var(--border-primary)'
          }}
        >
          <thead>
            <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-primary)' }}>
              <th className="weekly-day-head" style={{ borderRight: '1px solid var(--border-primary)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Time/Day
              </th>
              {timeSlots.map((slot) => (
                <th 
                  key={slot.label} 
                  className="weekly-time-head"
                  style={{ 
                    color: 'var(--text-secondary)', 
                    fontWeight: 'var(--fw-semibold)',
                    borderRight: '1px solid var(--border-primary)'
                  }}
                >
                  {slot.display}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const dayClasses = routine[day] || [];
              
              // We create a row representing the 12 columns
              const scheduledCells = dayClasses
                .map((cls) => ({ ...cls, ...getSlotDetails(cls.time) }))
                .filter((cls) => cls.startIdx < timeSlots.length)
                .sort((a, b) => a.startIdx - b.startIdx);

              let nextClassIdx = 0;

              return (
                <tr key={day} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  {/* Day cell */}
                  <td 
                    className="weekly-day-cell"
                    style={{ 
                      fontWeight: 'bold', 
                      background: 'var(--bg-input)', 
                      borderRight: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {day.substring(0, 3)}
                  </td>

                  {/* Render columns, skipping spanned ones */}
                  {timeSlots.map((_, idx) => {
                    const cls = scheduledCells[nextClassIdx];
                    if (cls && cls.startIdx === idx) {
                      nextClassIdx += 1;
                      const accentColor = normalizeAccentColor(cls.color);

                      return (
                        <td 
                          key={`${day}-${cls.id}`}
                          colSpan={cls.colSpan}
                          className="weekly-class-cell"
                          onClick={() => openEditModal(day, cls)}
                          style={{
                            borderRight: '1px solid var(--border-primary)',
                            verticalAlign: 'middle',
                            cursor: 'pointer'
                          }}
                        >
                          <div 
                            className="weekly-class-block"
                            style={{
                              background: `${accentColor}18`,
                              border: `1px solid ${accentColor}40`,
                              borderLeft: `4px solid ${accentColor}`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              textAlign: 'center'
                            }}
                          >
                            <div className="weekly-course-code" style={{ fontWeight: 'bold', color: accentColor }}>
                              {cls.course}
                            </div>
                            <div className="weekly-course-name" style={{ fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cls.name.split('(')[0].trim()}
                            </div>
                            <div className="weekly-room" style={{ color: 'var(--text-secondary)' }}>
                              {cls.room} {cls.teacher.split(',')[0].trim() !== 'TBA' && `(${cls.teacher.split(' ').pop()})`}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    const isCoveredByPrevious = scheduledCells.some((item) => idx > item.startIdx && idx < item.startIdx + item.colSpan);
                    if (isCoveredByPrevious) return null;

                    return (
                      <td 
                        key={`${day}-empty-${idx}`} 
                        className="weekly-empty-cell"
                        onClick={() => openAddModal(day, idx)}
                        style={{ 
                          borderRight: '1px solid var(--border-secondary)',
                          background: 'rgba(255,255,255,0.01)',
                          cursor: 'pointer'
                        }}
                      >
                        <div />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load Routine Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold', margin: 0 }}>Load Routine Template</h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Select a pre-defined routine template to load</p>
              </div>
              <button className="btn btn-icon" onClick={() => setShowLoadModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>

            {availableTemplates.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <p>No routine templates available.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    style={{
                      padding: '12px',
                      background: selectedTemplate?.id === template.id ? 'var(--accent-blue-glow)' : 'var(--bg-input)',
                      border: `1px solid ${selectedTemplate?.id === template.id ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: 0 }}>{template.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 4px' }}>{template.department}</span>
                          <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 4px' }}>Sem {template.semester}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{template.year}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTemplate?.id === template.id && (
                          <Check size={18} style={{ color: 'var(--accent-emerald)' }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}


            <div className="flex gap-2 mt-4">
              <button className="btn btn-secondary flex-1" onClick={() => setShowLoadModal(false)}>Cancel</button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleLoadTemplate}
                disabled={!selectedTemplate}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: selectedTemplate ? 1 : 0.5 }}
              >
                <Download size={16} /> Load Template
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <form className="modal routine-edit-modal" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
            <div className="routine-edit-header">
              <div>
                <h3>{editing.mode === 'add' ? 'Add Class' : 'Edit Class'}</h3>
                <p>Update OCR mistakes directly from the routine table.</p>
              </div>
              <button type="button" className="btn btn-icon btn-ghost" onClick={() => setEditing(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="routine-edit-body">
              <div className="routine-edit-grid">
              <label>
                Type
                <select className="input" value={editing.form.type} onChange={(event) => {
                  const newType = event.target.value;
                  // Auto-set periods based on type: Lab = 3 periods, Theory = 1 period
                  const periods = newType === 'Lab' ? 3 : 1;
                  const timeParts = editing.form.time.split(' - ');
                  const start = timeParts[0] || '08:00';
                  const newEnd = calculateEndTime(start, periods);
                  updateForm('time', `${start} - ${newEnd}`);
                  updateForm('type', newType);
                  // Auto-update color based on department and new type
                  updateForm('color', getAutoColorForCourse(editing.form.course, newType));
                }}>
                  <option value="Theory">Theory</option>
                  <option value="Lab">Lab</option>
                </select>
              </label>
              <label>
                Course Code
                <CourseAutocomplete
                  value={editing.form.course}
                  placeholder="Type course code (e.g., CSE1101)..."
                  type="code"
                  onCourseSelect={(course) => {
                    if (course) {
                      if (course.partialUpdate) {
                        // Manual typing - only update the code field
                        updateForm('course', course.code);
                      } else {
                        // Selected from suggestions - update both fields
                        updateForm('course', course.code);
                        updateForm('name', course.name);
                        // Auto-assign color based on department and type
                        updateForm('color', getAutoColorForCourse(course.code, editing.form.type));
                      }
                    }
                  }}
                />
              </label>
              <label className="routine-edit-wide">
                Course Name
                <CourseAutocomplete
                  value={editing.form.name}
                  placeholder="Type course name (e.g., Data Structures)..."
                  type="name"
                  onCourseSelect={(course) => {
                    if (course) {
                      if (course.partialUpdate) {
                        // Manual typing - only update the name field
                        updateForm('name', course.name);
                      } else {
                        // Selected from suggestions - update both fields
                        updateForm('name', course.name);
                        updateForm('course', course.code);
                      }
                    }
                  }}
                />
              </label>
              <label>
                Room
                <input className="input" value={editing.form.room} onChange={(event) => updateForm('room', event.target.value)} />
              </label>
              <label className="routine-edit-wide">
                Teacher
                <input className="input" value={editing.form.teacher} onChange={(event) => updateForm('teacher', event.target.value)} />
              </label>
              </div>
            </div>

            <div className="routine-edit-actions">
              {editing.mode === 'edit' && (
                <button type="button" className="btn btn-danger btn-sm" onClick={removeClass}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <div className="routine-edit-spacer" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
