import React, { useState, useEffect } from 'react';
import { CalendarDays, Download, Check, X } from 'lucide-react';
import { loadTemplates, addTemplate, updateTemplate, deleteTemplate } from '../../utils/routineTemplates';
import { getAutoColorForCourse } from '../../utils/autoColorPalette';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import './DashboardPage.css';

export default function RoutineTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editorForm, setEditorForm] = useState({
    name: '',
    semester: '1-1',
    department: 'CSE',
    year: new Date().getFullYear().toString(),
    routine: {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
    },
    weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  });
  const [editingClass, setEditingClass] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);

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

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  useEffect(() => {
    refreshTemplates();
  }, []);

  const refreshTemplates = () => {
    const loaded = loadTemplates();
    setTemplates(loaded);
  };

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

  const getSlotDetails = (timeStr) => {
    const [rawStart, rawEnd] = timeStr.split('-');
    const start = normalizeTime(rawStart || '');
    const end = normalizeTime(rawEnd || '');
    let startIdx = slotBoundaries.indexOf(start);
    let endIdx = slotBoundaries.indexOf(end);
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

  const openAddClass = (day, slotIdx) => {
    const start = slotBoundaries[slotIdx] || '08:00';
    const end = slotBoundaries[slotIdx + 1] || '08:50';
    const startTime = formatTimeForDisplay(start);
    const endTime = formatTimeForDisplay(end);
    
    setEditingClass({
      mode: 'add',
      day,
      form: {
        id: Date.now(),
        course: '',
        name: '',
        type: 'Theory',
        time: `${startTime} - ${endTime}`,
        room: '',
        teacher: '',
        color: getAutoColorForCourse('', 'Theory'),
      },
    });
  };

  const openEditClass = (day, cls) => {
    setEditingClass({
      mode: 'edit',
      originalDay: day,
      day,
      form: { ...cls },
    });
  };

  const updateClassForm = (field, value) => {
    setEditingClass((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
      },
    }));
  };

  const handleClassTypeChange = (newType) => {
    const periods = newType === 'Lab' ? 3 : 1;
    const timeParts = editingClass.form.time.split(' - ');
    const start = timeParts[0] || '08:00';
    const newEnd = calculateEndTime(start, periods);
    updateClassForm('time', `${start} - ${newEnd}`);
    updateClassForm('type', newType);
    updateClassForm('color', getAutoColorForCourse(editingClass.form.course, newType));
  };

  const saveClass = (event) => {
    event.preventDefault();
    const cleanClass = {
      ...editingClass.form,
      course: editingClass.form.course.trim() || 'Untitled',
      name: editingClass.form.name.trim() || 'Class',
      room: editingClass.form.room.trim() || 'TBA',
      teacher: editingClass.form.teacher.trim() || 'TBA',
      time: editingClass.form.time.trim() || '08:00 - 08:50',
    };

    const newRoutine = { ...editorForm.routine };
    
    if (editingClass.mode === 'add') {
      newRoutine[editingClass.day] = [...(newRoutine[editingClass.day] || []), cleanClass];
    } else {
      newRoutine[editingClass.originalDay] = (newRoutine[editingClass.originalDay] || []).filter(
        cls => cls.id !== cleanClass.id
      );
      const targetDay = cleanClass.day || editingClass.originalDay;
      newRoutine[targetDay] = [...(newRoutine[targetDay] || []), cleanClass];
    }

    setEditorForm({ ...editorForm, routine: newRoutine });
    setEditingClass(null);
  };

  const deleteClass = () => {
    if (editingClass.mode === 'edit') {
      const newRoutine = { ...editorForm.routine };
      newRoutine[editingClass.originalDay] = (newRoutine[editingClass.originalDay] || []).filter(
        cls => cls.id !== editingClass.form.id
      );
      setEditorForm({ ...editorForm, routine: newRoutine });
    }
    setEditingClass(null);
  };

  const handleLoadTemplate = (template) => {
    // Dispatch a custom event that WeeklyPlanner can listen to
    window.dispatchEvent(new CustomEvent('load-routine-template', { detail: template }));
  };

  // Main view - list of templates
  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="dashboard-header-section">
        <h1 className="page-title">Routine Templates</h1>
        <p className="page-description">Browse and load pre-defined semester routines into your schedule.</p>
      </div>

      {templates.length === 0 ? (
        <div className="glass-card-static" style={{ padding: '60px', textAlign: 'center' }}>
          <CalendarDays size={64} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '20px' }} />
          <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: '0 0 8px' }}>No Templates Available</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No routine templates have been created yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {templates.map(template => (
            <div key={template.id} className="glass-card-static">
              <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: 0 }}>{template.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 4px' }}>{template.department}</span>
                    <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 4px' }}>Sem {template.semester}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{template.year}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleLoadTemplate(template)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={14} /> Load This Routine
                </button>
              </div>

              {/* Routine Table Preview */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-primary)' }}>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'left', minWidth: '80px' }}>Day</th>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Course</th>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Time</th>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Room</th>
                      <th style={{ padding: '8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekDays.map(day => {
                      const dayClasses = template.routine[day] || [];
                      return dayClasses.length > 0 ? dayClasses.map((cls, idx) => (
                        <tr key={`${template.id}-${day}-${idx}`} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          {idx === 0 && (
                            <td rowSpan={dayClasses.length} style={{ padding: '8px', fontWeight: 'bold', color: 'var(--accent-blue)', textAlign: 'left', verticalAlign: 'top', borderRight: '1px solid var(--border-secondary)' }}>
                              {day}
                            </td>
                          )}
                          <td style={{ padding: '8px' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{cls.course}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{cls.name}</div>
                          </td>
                          <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{cls.time}</td>
                          <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{cls.room}</td>
                          <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{cls.teacher}</td>
                        </tr>
                      )) : (
                        <tr key={`${template.id}-${day}-empty`} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--text-tertiary)', textAlign: 'left' }}>{day}</td>
                          <td colSpan="4" style={{ padding: '8px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No classes</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}