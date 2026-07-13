import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import { findCourseByCode } from '../../data/courses';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoUrl from '../../assets/logo-silver.png';

export default function WeekSchedule() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('weekly');
  const [semesterStart, setSemesterStart] = useState(() => {
    const stored = localStorage.getItem('aust-semester-start');
    return stored || new Date().toISOString().split('T')[0];
  });
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newTask, setNewTask] = useState({
    courseCode: '',
    courseName: '',
    title: '',
    syllabus: '',
    date: '',
    time: ''
  });

  // State for viewing task details
  const [selectedTask, setSelectedTask] = useState(null);

  // Batch filter for calendar view
  const [batchFilter, setBatchFilter] = useState('all');

  // Available batch groups (A1, A2, B1, B2, C1, C2)
  const batchGroups = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // Check if user can add tasks (admin, CR, SR only)
  const canAddTask = user?.role === 'admin' || user?.role === 'cr' || user?.role === 'sr';

  // Get CR group info
  const crGroup = (() => {
    if (user?.role === 'cr') {
      return user?.section ? `Section ${user.section}` : user?.batch ? `Batch ${user.batch}` : '';
    }
    return '';
  })();

  // Get user's batch group (A1, A2, B1, B2, C1, C2)
  // Priority: section > labSection > calculated from batchNo
  const userBatchGroup = (() => {
    // First check if user has a section (like B2, A1, etc.)
    if (user?.section && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(user.section.toUpperCase())) {
      return user.section.toUpperCase();
    }
    // Then check labSection
    if (user?.labSection && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(user.labSection.toUpperCase())) {
      return user.labSection.toUpperCase();
    }
    // Fallback: calculate from batch number
    if (user?.batchNo) {
      const batchNo = parseInt(user.batchNo);
      // Map batch number to batch group (A1, A2, B1, B2, C1, C2)
      // Batch 52 -> A1, 53 -> A2, 54 -> B1, 55 -> B2, 56 -> C1, 57 -> C2, 58 -> A1, etc.
      const batchGroupIndex = (batchNo - 52) % 6;
      const groups = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return groups[batchGroupIndex >= 0 ? batchGroupIndex : 0];
    }
    return 'A1';
  })();

  // Save semester start date
  const saveSemesterStart = (date) => {
    setSemesterStart(date);
    localStorage.setItem('aust-semester-start', date);
  };

  // Handle course code selection
  const handleCourseCodeSelect = (course) => {
    if (course) {
      const courseData = findCourseByCode(course.code);
      setNewTask({
        ...newTask,
        courseCode: course.code,
        courseName: courseData ? courseData.name : (course.name || '')
      });
    } else {
      setNewTask({
        ...newTask,
        courseCode: '',
        courseName: ''
      });
    }
  };

  const getWeekDates = (refDate) => {
    const startOfWeek = new Date(refDate);
    startOfWeek.setDate(refDate.getDate() - refDate.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const getCurrentWeekNum = () => {
    const startDate = new Date(semesterStart);
    const diff = currentDate.getTime() - startDate.getTime();
    const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, Math.min(14, weekNum));
  };

  // Load tasks from localStorage
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('aust-week-tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('aust-week-tasks', JSON.stringify(updatedTasks));
  };

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTasksForDate = (date) => {
    const key = formatDateKey(date);
    let filteredTasks = tasks.filter(task => task.date === key);
    
    if (batchFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.batchGroup === batchFilter);
    }
    
    return filteredTasks;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.date) return;

    const task = {
      id: Date.now(),
      courseCode: newTask.courseCode.trim(),
      courseName: newTask.courseName.trim(),
      title: newTask.title.trim(),
      syllabus: newTask.syllabus.trim(),
      date: newTask.date,
      time: newTask.time || '',
      batchGroup: userBatchGroup,
      crGroup: crGroup || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [...tasks, task];
    saveTasks(updated);
    setNewTask({ 
      courseCode: '', 
      courseName: '', 
      title: '', 
      syllabus: '', 
      date: '', 
      time: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(task => task.id !== taskId);
    saveTasks(updated);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is before semester start
  const isBeforeSemesterStart = (date) => {
    const startDate = new Date(semesterStart);
    startDate.setHours(0, 0, 0, 0);
    return date < startDate;
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date) => {
    return date.getDate();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'class': return 'var(--accent-blue)';
      case 'lab': return 'var(--accent-purple)';
      case 'exam': return 'var(--accent-rose)';
      case 'assignment': return 'var(--accent-amber)';
      case 'event': return 'var(--accent-emerald)';
      default: return 'var(--accent-cyan)';
    }
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const scheduleRef = useRef(null);

  const downloadSchedulePDF = useCallback(async () => {
    const el = scheduleRef.current;
    if (!el) return;

    const root = document.documentElement;
    const cs = (n) => getComputedStyle(root).getPropertyValue(n).trim();
    const bg = cs('--bg-primary');
    const textPri = cs('--text-primary');
    const textSec = cs('--text-secondary');
    const textTer = cs('--text-tertiary');

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; left: -9999px; top: 0; width: fit-content; max-width: 1200px;
      background: ${bg};
      font-family: system-ui, -apple-system, sans-serif;
      padding-bottom: 10px;
    `;

    const ord = (n) => n + ({1:'st',2:'nd',3:'rd'}[n]||'th');
    const fmtSem = (s) => {
      const m = (s||'').match(/Year\s*(\d+)\s*-\s*Semester\s*(\d+)/i);
      return m ? `${ord(+m[1])} Year, ${+m[2]}${['th','st','nd','rd'][+m[2]]||'th'} Sem` : s;
    };
    const semStr = user?.yearSemester || user?.semester || '';
    const deptStr = user?.department || '';

    const brandBar = document.createElement('div');
    brandBar.style.cssText = 'padding: 4px 8px;';
    brandBar.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <img src="${logoUrl}" alt="AUSTWise" style="width: 28px; height: 28px; object-fit: contain; flex-shrink: 0;" />
          <div style="display: flex; flex-direction: column; justify-content: center; margin-top: -14px;">
            <div style="font-size: 16px; font-weight: 800; color: ${textPri}; letter-spacing: -0.01em; line-height: 1.1;">AUSTWise</div>
            <div style="font-size: 8px; color: ${textTer}; letter-spacing: 0.06em; text-transform: uppercase;">Your Academic Companion</div>
          </div>
        </div>
        ${(deptStr || semStr) ? `<div style="font-size: 12px; color: ${textSec}; font-weight: 600; text-align: center; line-height: 1.5;">
          ${deptStr ? `<div>${deptStr}</div>` : ''}
          ${semStr ? `<div>${fmtSem(semStr)}</div>` : ''}
        </div>` : ''}
        <div style="text-align: right;">
          <div style="font-size: 8px; color: ${textTer}; text-transform: uppercase; letter-spacing: 0.06em;">Generated</div>
          <div style="font-size: 11px; color: ${textPri}; font-weight: 700; margin-top: 1px;">
            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    `;
    container.appendChild(brandBar);

    const isMonthly = viewMode === 'monthly';
    const clone = el.cloneNode(true);
    clone.style.cssText = `overflow: visible; border-radius: ${isMonthly ? 0 : 8}px; padding: 0;`;
    clone.style.margin = '6px 8px 0';
    container.appendChild(clone);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: isMonthly ? 3 : 2.5, useCORS: true, backgroundColor: bg || '#ffffff',
        logging: false, width: container.scrollWidth, height: container.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgW = isMonthly ? canvas.width * 0.2646 : 290;
      const imgH = isMonthly ? canvas.height * 0.2646 : (canvas.height * imgW) / canvas.width;
      const pageW = imgW + 8;
      const pageH = imgH + 4;

      const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: [pageW, pageH] });
      const hex = bg.replace('#', '');
      if (hex.length >= 6) {
        pdf.setFillColor(parseInt(hex.substring(0,2),16), parseInt(hex.substring(2,4),16), parseInt(hex.substring(4,6),16));
        pdf.rect(0, 0, pageW, pageH, 'F');
      }
      pdf.addImage(imgData, 'PNG', 4, 2, imgW, imgH);
      pdf.save('AUST-14Week-Schedule.pdf');
    } finally {
      document.body.removeChild(container);
    }
  }, [user, viewMode]);

  const downloadScheduleImage = useCallback(async () => {
    const el = scheduleRef.current;
    if (!el) return;

    const root = document.documentElement;
    const cs = (n) => getComputedStyle(root).getPropertyValue(n).trim();
    const bg = cs('--bg-primary');
    const textPri = cs('--text-primary');
    const textSec = cs('--text-secondary');
    const textTer = cs('--text-tertiary');

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; left: -9999px; top: 0; width: fit-content; max-width: 1200px;
      background: ${bg};
      font-family: system-ui, -apple-system, sans-serif;
      padding-bottom: 10px;
    `;

    const ord = (n) => n + ({1:'st',2:'nd',3:'rd'}[n]||'th');
    const fmtSem = (s) => {
      const m = (s||'').match(/Year\s*(\d+)\s*-\s*Semester\s*(\d+)/i);
      return m ? `${ord(+m[1])} Year, ${+m[2]}${['th','st','nd','rd'][+m[2]]||'th'} Sem` : s;
    };
    const semStr = user?.yearSemester || user?.semester || '';
    const deptStr = user?.department || '';

    const brandBar = document.createElement('div');
    brandBar.style.cssText = 'padding: 4px 8px;';
    brandBar.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <img src="${logoUrl}" alt="AUSTWise" style="width: 28px; height: 28px; object-fit: contain; flex-shrink: 0;" />
          <div style="display: flex; flex-direction: column; justify-content: center; margin-top: -14px;">
            <div style="font-size: 16px; font-weight: 800; color: ${textPri}; letter-spacing: -0.01em; line-height: 1.1;">AUSTWise</div>
            <div style="font-size: 8px; color: ${textTer}; letter-spacing: 0.06em; text-transform: uppercase;">Your Academic Companion</div>
          </div>
        </div>
        ${(deptStr || semStr) ? `<div style="font-size: 12px; color: ${textSec}; font-weight: 600; text-align: center; line-height: 1.5;">
          ${deptStr ? `<div>${deptStr}</div>` : ''}
          ${semStr ? `<div>${fmtSem(semStr)}</div>` : ''}
        </div>` : ''}
        <div style="text-align: right;">
          <div style="font-size: 8px; color: ${textTer}; text-transform: uppercase; letter-spacing: 0.06em;">Generated</div>
          <div style="font-size: 11px; color: ${textPri}; font-weight: 700; margin-top: 1px;">
            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    `;
    container.appendChild(brandBar);

    const isMonthly = viewMode === 'monthly';
    const clone = el.cloneNode(true);
    clone.style.cssText = `overflow: visible; border-radius: ${isMonthly ? 0 : 8}px; padding: 0;`;
    clone.style.margin = '6px 8px 0';
    container.appendChild(clone);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: isMonthly ? 3 : 2.5, useCORS: true, backgroundColor: bg || '#ffffff',
        logging: false, width: container.scrollWidth, height: container.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = 'AUST-14Week-Schedule.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      document.body.removeChild(container);
    }
  }, [user, viewMode]);

  return (
    <div className="glass-card-static animate-fadeInUp">
      <div className="dash-header-three mb-8">
        <div className="dash-header-left">
          <div className="icon" style={{ backgroundColor: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', padding: '12px', borderRadius: '12px' }}>
            <Calendar size={28} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-secondary)' }}>Academic calendar with tasks & events</p>
          </div>
        </div>
        {/* Middle: Export + Settings */}
        <div className="dash-header-center">
          <div className="export-dropdown" ref={exportRef}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowExportMenu(!showExportMenu)} aria-label="Export schedule" aria-haspopup="true">
              <FileDown size={14} /> Export <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button className="export-menu-item" onClick={() => { downloadSchedulePDF(); setShowExportMenu(false); }}>
                  <FileDown size={14} /> Export as PDF
                </button>
                <button className="export-menu-item" onClick={() => { downloadScheduleImage(); setShowExportMenu(false); }}>
                  <FileDown size={14} /> Export as Image
                </button>
              </div>
            )}
          </div>
          <button
            className="schedule-nav-btn"
            onClick={() => setShowSettings(true)}
            title="Set semester start date"
          >
            <Calendar size={18} />
          </button>
        </div>
        {/* Right: View toggle + Navigation */}
        <div className="dash-header-right">
          <div className="view-toggle">
            {['daily', 'weekly', 'monthly'].map(mode => (
              <button
                key={mode}
                className={`view-toggle-btn${viewMode === mode ? ' active' : ''}`}
                onClick={() => {
                  if (mode === 'daily' && viewMode !== 'daily') {
                    setCurrentDate(new Date());
                  } else if (mode === 'monthly' && viewMode !== 'monthly') {
                    const d = new Date(currentDate);
                    d.setDate(15);
                    setCurrentDate(d);
                  }
                  setViewMode(mode);
                }}
              >
                {mode === 'daily' ? 'Day' : mode === 'weekly' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          <button className="schedule-nav-btn" onClick={() => {
            const d = new Date(currentDate);
            if (viewMode === 'daily') d.setDate(d.getDate() - 1);
            else if (viewMode === 'monthly') d.setMonth(d.getMonth() - 1);
            else d.setDate(d.getDate() - 7);
            setCurrentDate(d);
          }}>
            <ChevronLeft size={20} />
          </button>
          <span className="schedule-week-label">
            {viewMode === 'daily'
              ? currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
              : viewMode === 'monthly'
                ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : `Week ${getCurrentWeekNum()}`}
          </span>
          <button className="schedule-nav-btn" onClick={() => {
            const d = new Date(currentDate);
            if (viewMode === 'daily') d.setDate(d.getDate() + 1);
            else if (viewMode === 'monthly') d.setMonth(d.getMonth() + 1);
            else d.setDate(d.getDate() + 7);
            setCurrentDate(d);
          }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div ref={scheduleRef}>
      {viewMode === 'daily' ? (() => {
        const date = currentDate;
        const dayTasks = getTasksForDate(date);
        return (
          <div className={`schedule-daily-view${isToday(date) ? ' today' : ''}`}>
            <div className="schedule-daily-header">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <span className={`schedule-daily-dayname${isToday(date) ? ' today' : ''}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                <span className="schedule-daily-date">
                  {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              {isToday(date) && (
                <span className="schedule-daily-badge">TODAY</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dayTasks.map(task => (
                <div key={task.id} onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                  className="schedule-daily-task"
                  style={{ background: `${getTypeColor(task.type)}15`, borderLeft: `3px solid ${getTypeColor(task.type)}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${getTypeColor(task.type)}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${getTypeColor(task.type)}15`; }}
                >
                  <div className="schedule-daily-task-title">{task.title}</div>
                  <div className="schedule-daily-task-meta">
                    {task.courseCode && <span className="schedule-daily-task-code">{task.courseCode}</span>}
                    {task.batchGroup && <span className="schedule-daily-task-batch">{task.batchGroup}</span>}
                    {task.time && <span className="schedule-daily-task-time">{task.time}</span>}
                  </div>
                </div>
              ))}
              {dayTasks.length === 0 && (
                <div className="schedule-daily-empty">No tasks for this day</div>
              )}
            </div>
            {canAddTask && (
              <button className="schedule-add-btn" onClick={(e) => { e.stopPropagation(); setSelectedDay(date); setNewTask({ ...newTask, date: formatDateKey(date) }); setShowAddModal(true); }}>
                + Add Task
              </button>
            )}
          </div>
        );
      })() : viewMode === 'monthly' ? (
        <>
          <div className="schedule-month-grid" style={{ marginBottom: '12px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="schedule-month-header">{day}</div>
            ))}
          </div>
          <div className="schedule-month-grid" style={{ alignItems: 'start' }}>
            {getMonthDates().map((date, idx) => {
              if (!date) return <div key={`pad-${idx}`} />;
              const dayTasks = getTasksForDate(date);
              return (
                <div key={idx} className={`schedule-day-card${isToday(date) ? ' today' : ''}`}>
                  <div className={`schedule-day-num${isToday(date) ? ' today' : ''}`}>{getDayNumber(date)}</div>
                  <div className="schedule-task-list">
                    {dayTasks.slice(0, 5).map(task => (
                      <div key={task.id} onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                        className="schedule-task-item"
                        style={{ background: `${getTypeColor(task.type)}15` }}>
                          {task.batchGroup && <span className="schedule-task-batch">{task.batchGroup}</span>}
                          <div className="schedule-task-info">
                            {task.courseCode && <span className="schedule-task-code">{task.courseCode}</span>}
                            <span className="schedule-task-title">{task.title}</span>
                          </div>
                      </div>
                    ))}
                    {dayTasks.length > 5 && (
                      <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textAlign: 'center' }}>+{dayTasks.length - 5} more</div>
                    )}
                    {dayTasks.length === 0 && <div className="schedule-empty">No tasks</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="schedule-grid" style={{ marginBottom: '12px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="schedule-day-header">{day}</div>
            ))}
          </div>
          <div className="schedule-grid" style={{ alignItems: 'start' }}>
            {weekDates.map((date, idx) => {
              const dayTasks = getTasksForDate(date);
              return (
                <div key={idx} className={`schedule-day-card${isToday(date) ? ' today' : ''}${isBeforeSemesterStart(date) ? ' before-semester' : ''}`}>
                  {isBeforeSemesterStart(date) ? (
                    <div className="schedule-empty">{getDayNumber(date)}</div>
                  ) : (
                    <>
                      <div className={`schedule-day-num${isToday(date) ? ' today' : ''}`}>{getDayNumber(date)}</div>
                      <div className="schedule-task-list">
                        {dayTasks.map(task => (
                          <div key={task.id} onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                            className="schedule-task-item"
                            style={{ background: `${getTypeColor(task.type)}15` }}>
                            {task.batchGroup && <span className="schedule-task-batch">{task.batchGroup}</span>}
                            <div className="schedule-task-info">
                              {task.courseCode && <span className="schedule-task-code">{task.courseCode}</span>}
                              <span className="schedule-task-title">{task.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length === 0 && <div className="schedule-empty">No tasks</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      </div>

      {canAddTask && viewMode !== 'daily' && (
        <button className="schedule-add-btn" onClick={() => {
          const d = currentDate;
          setSelectedDay(d);
          setNewTask({ ...newTask, date: formatDateKey(d) });
          setShowAddModal(true);
        }}>
          + Add Task
        </button>
      )}

      {/* Batch Filter */}
      <div className="schedule-filter-bar">
        <span className="schedule-filter-label">Filter:</span>
        <button
          className={`schedule-filter-btn${batchFilter === 'all' ? ' active-all' : ''}`}
          onClick={() => setBatchFilter('all')}
        >
          All
        </button>
        {batchGroups.map(bg => (
          <button
            key={bg}
            className={`schedule-filter-btn${batchFilter === bg ? ' active-batch' : ''}`}
            onClick={() => setBatchFilter(bg)}
          >
            {bg}
          </button>
        ))}
        {batchFilter !== 'all' && (
          <span className="schedule-filter-hint">
            (Showing {batchFilter} only)
          </span>
        )}
      </div>

      {/* Settings Modal - Set Semester Start Date */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)} style={{ overflow: 'hidden', padding: '16px' }}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', width: '88%', padding: '18px 20px 16px', margin: 0, animation: 'scaleIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-secondary)' }}>
              <div className="btn-icon" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', fontSize: '15px', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px' }}>
                📅
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', margin: 0, lineHeight: 1.3 }}>Semester Settings</h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', margin: '1px 0 0' }}>Start date for week calculation</p>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowSettings(false)} style={{ marginLeft: 'auto', fontSize: '14px' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Semester Start Date
                </label>
                <input type="date" value={semesterStart} onChange={(e) => saveSemesterStart(e.target.value)} className="input" />
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Sets when <strong>Week 1</strong> begins.
                </p>
              </div>

              <div style={{
                background: 'var(--accent-blue-glow)',
                border: '1px solid color-mix(in srgb, var(--accent-blue) 18%, transparent)',
                borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)' }}>📊</span>
                  <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--accent-blue)' }}>
                    Week {getCurrentWeekNum()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)' }}>
                  {new Date(semesterStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — started
                </p>
              </div>

              <div className="flex gap-2" style={{ paddingTop: '2px' }}>
                <button className="btn btn-secondary flex-1" onClick={() => setShowSettings(false)} style={{ fontSize: 'var(--fs-xs)' }}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={() => setShowSettings(false)} style={{ fontSize: 'var(--fs-xs)' }}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%', padding: 'var(--sp-5)', margin: 0 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: 0 }}>{selectedTask.title}</h3>
                {selectedTask.courseName && (
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-cyan)', margin: '4px 0 0' }}>{selectedTask.courseName}</p>
                )}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedTask(null)} style={{ flexShrink: 0 }}>
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedTask.courseCode && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Course:</span>
                  <span className="badge badge-cyan" style={{ fontWeight: 'bold' }}>{selectedTask.courseCode}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Date:</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{selectedTask.date}</span>
              </div>
              {selectedTask.time && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Time:</span>
                  <span style={{ fontSize: 'var(--fs-sm)' }}>{selectedTask.time}</span>
                </div>
              )}
              {selectedTask.batchGroup && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Batch:</span>
                  <span className="badge badge-amber" style={{ fontWeight: 'bold' }}>{selectedTask.batchGroup}</span>
                </div>
              )}
              {selectedTask.syllabus && (
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Syllabus:</span>
                  <div className="input" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', padding: 'var(--sp-3)', cursor: 'default', opacity: 0.9 }}>
                    {selectedTask.syllabus}
                  </div>
                </div>
              )}
              {selectedTask.crGroup && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Posted by:</span>
                  <span className="badge badge-emerald">{selectedTask.crGroup}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)' }}>
              {canAddTask && (
                <button className="btn btn-danger btn-sm flex-1" onClick={() => { handleDeleteTask(selectedTask.id); setSelectedTask(null); }}>
                  Delete Task
                </button>
              )}
              <button className="btn btn-secondary btn-sm flex-1" onClick={() => setSelectedTask(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal — minimal */}
      {showAddModal && canAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{ overflow: 'hidden', padding: '24px' }}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '300px', width: '85%', padding: '8px 10px 8px', margin: 0, maxHeight: 'none', overflow: 'visible', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '600', margin: '0 0 4px', color: 'var(--text-secondary)' }}>New Task</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ maxWidth: '100%' }}>
                <CourseAutocomplete
                  value={newTask.courseCode}
                  onCourseSelect={handleCourseCodeSelect}
                  placeholder="Course code (e.g. CSE1101)"
                  type="code"
                />
              </div>
              <input type="text" value={newTask.courseName} onChange={(e) => setNewTask({ ...newTask, courseName: e.target.value })} className="input" placeholder="Course name" disabled style={{ opacity: newTask.courseName ? 1 : 0.6, fontSize: '9px', padding: '3px 6px', maxWidth: '100%', boxSizing: 'border-box', margin: 0 }} />
              <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input" placeholder="Title (e.g. Quiz 1)" required style={{ fontSize: '9px', padding: '3px 6px', maxWidth: '100%', boxSizing: 'border-box', margin: 0 }} />
              <div style={{ display: 'flex', gap: '2px' }}>
                <input type="date" value={newTask.date} onChange={(e) => setNewTask({ ...newTask, date: e.target.value })} className="input" required style={{ fontSize: '9px', padding: '3px 6px', width: '100%', minWidth: 0, boxSizing: 'border-box', margin: 0 }} />
                <input type="time" value={newTask.time} onChange={(e) => setNewTask({ ...newTask, time: e.target.value })} className="input" style={{ fontSize: '9px', padding: '3px 6px', width: '100%', minWidth: 0, boxSizing: 'border-box', margin: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: '3px', marginTop: '1px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '9px', padding: '3px 6px', minHeight: '22px' }}>Add</button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '9px', padding: '3px 6px', minHeight: '22px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}