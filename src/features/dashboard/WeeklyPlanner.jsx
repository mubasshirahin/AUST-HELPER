import React, { useState } from 'react';
import { CalendarDays, Trash2, X, Download, Eye, Check, RotateCcw, FileDown } from 'lucide-react';
import { useRoutine } from '../../context/RoutineContext';
import { ocrImportedRoutine, ocrImportedWeekDays } from '../../context/RoutineContext';
import { normalizeAccentColor, getCourseColor } from '../../utils/colorPalette';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import { findCourseByCode, findCourseByName } from '../../data/courses';
import { getAutoColorForCourse } from '../../utils/autoColorPalette';
import { loadTemplates } from '../../utils/routineTemplates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    color: getAutoColorForCourse('', 'Theory'),
    biWeekly: false,
    weekGroup: 'first',
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

  const downloadSchedulePDF = async () => {
    const tableWrap = document.querySelector('.weekly-table-wrap');
    if (!tableWrap) return;

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      padding: 32px 28px; background: #ffffff;
      width: fit-content; max-width: 1200px;
    `;

    const titleRow = document.createElement('div');
    titleRow.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    `;
    titleRow.innerHTML = `
      <div>
        <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0; letter-spacing: 0.02em;">
          📚 Class Schedule
        </h1>
        <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
          AUST · Sunday – Thursday
        </p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 10px; color: #9ca3af; margin: 0;">Generated</p>
        <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0; font-weight: 500;">
          ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    `;
    container.appendChild(titleRow);

    const clone = tableWrap.cloneNode(true);
    clone.style.cssText = `
      overflow: visible; border-radius: 0; padding: 0;
      border: 1px solid #d1d5db;
    `;
    container.appendChild(clone);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .weekly-table {
        border-collapse: collapse !important;
        width: 100% !important;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
      }
      .weekly-table th,
      .weekly-table td {
        border: 1px solid #d1d5db !important;
        padding: 8px 10px !important;
        font-size: 11px !important;
        background: #ffffff !important;
      }
      .weekly-table thead th {
        background: #f3f4f6 !important;
        font-weight: 600 !important;
        color: #374151 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.04em !important;
      }
      .weekly-day-head, .weekly-day-cell {
        background: #f9fafb !important;
        font-weight: 700 !important;
        color: #111827 !important;
        text-align: center !important;
        white-space: nowrap !important;
        position: static !important;
      }
      .weekly-class-block {
        border-radius: 6px !important;
        padding: 6px 8px !important;
        min-height: auto !important;
        background: #f9fafb !important;
        border-left: 3px solid currentColor !important;
      }
      .weekly-course-code {
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 1.3 !important;
      }
      .weekly-course-name {
        font-size: 10px !important;
        color: #374151 !important;
        line-height: 1.3 !important;
      }
      .weekly-room {
        font-size: 10px !important;
        color: #6b7280 !important;
      }
      .weekly-empty-cell div:after {
        content: none !important;
      }
      .weekly-empty-cell {
        background: #fafafa !important;
      }
      * {
        box-shadow: none !important;
        transform: none !important;
        transition: none !important;
      }
    `;
    container.appendChild(styleEl);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = pdfW - 16;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (imgH <= pdfH - 16) {
        pdf.addImage(imgData, 'PNG', 8, (pdfH - imgH) / 2, imgW, imgH);
      } else {
        pdf.addImage(imgData, 'PNG', 8, 8, imgW, imgH);
      }

      pdf.save('class-schedule.pdf');
    } finally {
      document.body.removeChild(container);
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
          <button className="btn btn-primary btn-sm" onClick={downloadSchedulePDF} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileDown size={14} /> PDF
          </button>
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
        <table className="weekly-table">
          <thead>
            <tr>
              <th className="weekly-day-head">Time/Day</th>
              {timeSlots.map((slot) => (
                <th key={slot.label} className="weekly-time-head">
                  {slot.display}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const dayClasses = routine[day] || [];
              
              const scheduledCells = dayClasses
                .map((cls) => ({ ...cls, ...getSlotDetails(cls.time) }))
                .filter((cls) => cls.startIdx < timeSlots.length)
                .sort((a, b) => a.startIdx - b.startIdx);

              let nextClassIdx = 0;

              return (
                <tr key={day}>
                  <td className="weekly-day-cell">
                    {day.substring(0, 3)}
                  </td>

                  {/* Render columns, skipping spanned ones */}
                  {timeSlots.map((_, idx) => {
                    const isCoveredByPrevious = scheduledCells.some((item) => idx > item.startIdx && idx < item.startIdx + item.colSpan);
                    if (isCoveredByPrevious) return null;

                    const classesAtIdx = scheduledCells.filter((c) => c.startIdx === idx);
                    if (classesAtIdx.length > 0) {
                      const colSpan = classesAtIdx[0].colSpan;
                      const isBiWeekly = classesAtIdx.some((c) => c.biWeekly);

                      if (isBiWeekly) {
                        nextClassIdx += classesAtIdx.length;
                        const firstCls = classesAtIdx.find((c) => c.weekGroup === 'first') || classesAtIdx[0];
                        const secondCls = classesAtIdx.find((c) => c.weekGroup === 'second');
                        const baseColor = getCourseColor(firstCls.course);

                        return (
                          <td
                            key={`${day}-bw-${idx}`}
                            colSpan={colSpan}
                            className="weekly-class-cell"
                          >
                            <div
                              className="weekly-class-block"
                              style={{
                                background: 'var(--bg-input)',
                                borderLeft: `3px solid ${baseColor}`,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 0,
                                minHeight: 0,
                                gap: 0,
                              }}
                            >
                              <div
                                onClick={() => openEditModal(day, firstCls)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '4px 6px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid var(--border-secondary)',
                                }}
                              >
                                <span style={{ fontSize: '7px', fontWeight: 'var(--fw-bold)', color: 'var(--accent-amber)', whiteSpace: 'nowrap', flexShrink: 0, width: '32px' }}>Week 1</span>
                                <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                  <span style={{ fontWeight: 'bold', color: baseColor, fontSize: '10px' }}>{firstCls.course}</span>
                                  <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>{firstCls.room}</span>
                                </div>
                                <span style={{ width: '32px', flexShrink: 0 }} />
                              </div>

                              {secondCls ? (
                                <div
                                  onClick={() => openEditModal(day, secondCls)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <span style={{ fontSize: '7px', fontWeight: 'var(--fw-bold)', color: 'var(--accent-amber)', whiteSpace: 'nowrap', flexShrink: 0, width: '32px' }}>Week 2</span>
                                  <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                    <span style={{ fontWeight: 'bold', color: getCourseColor(secondCls.course), fontSize: '10px' }}>{secondCls.course}</span>
                                    <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>{secondCls.room}</span>
                                  </div>
                                  <span style={{ width: '32px', flexShrink: 0 }} />
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    const start = slotBoundaries[idx] || '08:00';
                                    const end = slotBoundaries[idx + colSpan] || calculateEndTime(start, colSpan);
                                    setEditing({
                                      mode: 'add',
                                      day,
                                      form: {
                                        ...emptyForm,
                                        type: 'Lab',
                                        time: `${start} - ${end}`,
                                        biWeekly: true,
                                        weekGroup: 'second',
                                        color: firstCls.color,
                                      },
                                    });
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    color: 'var(--text-tertiary)',
                                    fontSize: '10px',
                                  }}
                                >
                                  <span style={{ fontSize: '7px', fontWeight: 'var(--fw-bold)', color: 'var(--accent-amber)', whiteSpace: 'nowrap', flexShrink: 0, width: '32px' }}>Week 2</span>
                                  <div style={{ flex: 1, textAlign: 'center' }}>+</div>
                                  <span style={{ width: '32px', flexShrink: 0 }} />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      }

                      // Normal (non-bi-weekly): single or multiple stacked
                      nextClassIdx += classesAtIdx.length;
                      if (classesAtIdx.length === 1) {
                        const cls = classesAtIdx[0];
                        const accentColor = getCourseColor(cls.course);
                        return (
                          <td 
                            key={`${day}-${cls.id}`}
                            colSpan={colSpan}
                            className="weekly-class-cell"
                            onClick={() => openEditModal(day, cls)}
                          >
                            <div 
                              className="weekly-class-block"
                              style={{
                                background: 'var(--bg-input)',
                                borderLeft: `3px solid ${accentColor}`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                textAlign: 'center'
                              }}
                            >
                              <div className="weekly-course-code" style={{ color: accentColor }}>
                                {cls.course}
                              </div>
                              <div className="weekly-course-name" style={{ fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
                                {cls.name.split('(')[0].trim()}
                              </div>
                              <div className="weekly-room" style={{ color: 'var(--text-tertiary)' }}>
                                {cls.room}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                          <td 
                            key={`${day}-${idx}`}
                            colSpan={colSpan}
                            className="weekly-class-cell"
                            style={{ padding: '2px' }}
                          >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {classesAtIdx.map((cls) => {
                              const clr = getCourseColor(cls.course);
                              return (
                                <div
                                  key={cls.id}
                                  onClick={() => openEditModal(day, cls)}
                                  style={{
                                    background: 'var(--bg-input)',
                                    borderLeft: `3px solid ${clr}`,
                                    borderRadius: '4px',
                                    padding: '3px 6px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                  }}
                                >
                                  <span style={{ fontWeight: 'bold', color: clr, fontSize: '10px' }}>
                                    {cls.course}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={`${day}-empty-${idx}`} 
                        className="weekly-empty-cell"
                        onClick={() => openAddModal(day, idx)}
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
              </div>
              <button type="button" className="btn btn-icon btn-ghost" onClick={() => setEditing(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="routine-edit-body">
              <div className="routine-edit-grid">
              <div className="routine-edit-type-row">
                <div className="type-toggle" role="radiogroup">
                  {['Theory', 'Lab'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-toggle-btn${editing.form.type === t ? ' active' : ''}`}
                      onClick={() => {
                        const periods = t === 'Lab' ? 3 : 1;
                        const timeParts = editing.form.time.split(' - ');
                        const start = timeParts[0] || '08:00';
                        const newEnd = calculateEndTime(start, periods);
                        updateForm('time', `${start} - ${newEnd}`);
                        updateForm('type', t);
                        updateForm('color', getAutoColorForCourse(editing.form.course, t));
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                Course Code
                <CourseAutocomplete
                  value={editing.form.course}
                  placeholder="Type course code (e.g., CSE1101)..."
                  type="code"
                  onCourseSelect={(course) => {
                    if (course) {
                      if (course.partialUpdate) {
                        updateForm('course', course.code);
                      } else {
                        updateForm('course', course.code);
                        updateForm('name', course.name);
                        updateForm('color', getAutoColorForCourse(course.code, editing.form.type));
                      }
                    }
                  }}
                />
              </label>
              <label>
                Course Name
                <CourseAutocomplete
                  value={editing.form.name}
                  placeholder="Type course name (e.g., Data Structures)..."
                  type="name"
                  onCourseSelect={(course) => {
                    if (course) {
                      if (course.partialUpdate) {
                        updateForm('name', course.name);
                      } else {
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
              <label>
                Teacher
                <input className="input" value={editing.form.teacher} onChange={(event) => updateForm('teacher', event.target.value)} />
              </label>
              {editing.form.type === 'Lab' && (
                <>
                  <div className="routine-edit-type-row">
                    <label className="biweekly-label">
                      <input
                        type="checkbox"
                        checked={editing.form.biWeekly}
                        onChange={(e) => updateForm('biWeekly', e.target.checked)}
                      />
                      <span>0.75 credit (bi-weekly)</span>
                    </label>
                  </div>
                  {editing.form.biWeekly && (
                    <div className="routine-edit-type-row">
                      <div className="week-split-box">
                        <div
                          className={`week-split-option${editing.form.weekGroup === 'first' ? ' active' : ''}`}
                          onClick={() => updateForm('weekGroup', 'first')}
                        >
                          1st Week
                        </div>
                        <div className="week-split-divider" />
                        <div
                          className={`week-split-option${editing.form.weekGroup === 'second' ? ' active' : ''}`}
                          onClick={() => updateForm('weekGroup', 'second')}
                        >
                          2nd Week
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
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
