import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoutine } from '../../context/RoutineContext';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import { findCourseByCode } from '../../data/courses';

export default function WeekSchedule() {
  const { user } = useAuth();
  const { routine, weekDays } = useRoutine();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [semesterStart, setSemesterStart] = useState(() => {
    const stored = localStorage.getItem('aust-semester-start');
    return stored || new Date().toISOString().split('T')[0];
  });
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

  // Generate 14 weeks of dates starting from semester start date
  // Always start from Sunday of the week containing the semester start date
  const getWeekDates = (weekNum) => {
    const startDate = new Date(semesterStart);
    // Find the Sunday of the week containing the start date
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - startDate.getDay());
    // Add weeks offset
    startOfWeek.setDate(startOfWeek.getDate() + (weekNum - 1) * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

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
    return date.toISOString().split('T')[0];
  };

  const getTasksForDate = (date) => {
    const key = formatDateKey(date);
    let filteredTasks = tasks.filter(task => task.date === key);
    
    // Filter by batch if a specific batch is selected
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

  return (
    <div className="glass-card-static animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', padding: '6px', borderRadius: '8px' }}>
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>14-Week Schedule</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Academic calendar with tasks & events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(true)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            title="Set semester start date"
          >
            <Calendar size={16} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek <= 1}
            style={{ border: 'none', background: 'transparent', cursor: currentWeek <= 1 ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)', opacity: currentWeek <= 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>
            Week {currentWeek}
          </span>
          <button
            className="btn btn-icon"
            onClick={() => setCurrentWeek(Math.min(14, currentWeek + 1))}
            disabled={currentWeek >= 14}
            style={{ border: 'none', background: 'transparent', cursor: currentWeek >= 14 ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)', opacity: currentWeek >= 14 ? 0.4 : 1 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', padding: '8px', fontSize: 'var(--fs-xs)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {weekDates.map((date, idx) => {
          const dayTasks = getTasksForDate(date);
          const dayClasses = routine[weekDays[idx]] || [];
          // Calculate dynamic height based on ALL content
          const contentCount = dayTasks.length + (dayClasses.length > 0 ? 1 : 0);
          const dynamicMinHeight = 70 + (contentCount * 30);

          return (
            <div
              key={idx}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                background: isToday(date) ? 'var(--accent-blue-glow)' : 'var(--bg-input)',
                border: isToday(date) ? '1px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                minHeight: `${Math.max(80, dynamicMinHeight)}px`,
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {isBeforeSemesterStart(date) ? (
                <div style={{ textAlign: 'center', padding: '6px 0', color: 'var(--text-tertiary)', opacity: 0.3, flex: 1 }}>
                  <span style={{ fontSize: '10px' }}>{getDayNumber(date)}</span>
                </div>
              ) : (
                <>
                  {/* Date Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid var(--border-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: isToday(date) ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                        {getDayNumber(date)}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                        {getMonthName(date)}
                      </span>
                    </div>
                    {isToday(date) && (
                      <span style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--accent-blue)', background: 'var(--accent-blue-glow)', padding: '1px 5px', borderRadius: '4px' }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Content Area - Classes and ALL Tasks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* Classes */}
                    {dayClasses.slice(0, 1).map((cls, i) => (
                      <div key={i} style={{ fontSize: '9px', padding: '3px 5px', background: `${cls.color}20`, borderLeft: `2px solid ${cls.color}`, borderRadius: '3px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        {cls.course}
                      </div>
                    ))}

                    {/* ALL Tasks - Show every task, no limit */}
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        style={{ 
                          fontSize: '10px', 
                          padding: '3px 5px', 
                          background: `${getTypeColor(task.type)}15`, 
                          borderLeft: `3px solid ${getTypeColor(task.type)}`, 
                          borderRadius: '3px', 
                          color: 'var(--text-primary)', 
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          fontWeight: '500'
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${getTypeColor(task.type)}30`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${getTypeColor(task.type)}15`; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{task.title}</span>
                          {canAddTask && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent-rose)', padding: '0 3px', fontSize: '11px', marginLeft: '3px' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '1px', flexWrap: 'wrap' }}>
                          {task.courseCode && (
                            <span style={{ fontSize: '8px', color: 'var(--accent-cyan)', background: 'var(--accent-cyan-glow)', padding: '0 3px', borderRadius: '2px', fontWeight: 'bold' }}>
                              {task.courseCode}
                            </span>
                          )}
                          {task.batchGroup && (
                            <span style={{ fontSize: '8px', color: 'var(--accent-amber)', background: 'var(--accent-amber-glow)', padding: '0 3px', borderRadius: '2px', fontWeight: 'bold' }}>
                              {task.batchGroup}
                            </span>
                          )}
                          {task.time && (
                            <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>
                              {task.time}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {dayTasks.length === 0 && dayClasses.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '9px', fontStyle: 'italic' }}>
                        No tasks
                      </div>
                    )}
                  </div>

                  {/* Add Task Button */}
                  {canAddTask && (
                    <button
                      style={{ 
                        marginTop: '4px', 
                        width: '100%',
                        padding: '4px',
                        background: 'var(--bg-secondary)',
                        border: '1px dashed var(--border-secondary)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        color: 'var(--accent-cyan)',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDay(date);
                        setNewTask({ ...newTask, date: formatDateKey(date) });
                        setShowAddModal(true);
                      }}
                    >
                      + Add
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-secondary)' }}>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Filter:</span>
        <button
          onClick={() => setBatchFilter('all')}
          style={{
            fontSize: '9px',
            padding: '2px 8px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: batchFilter === 'all' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
            color: batchFilter === 'all' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
        >
          All
        </button>
        {batchGroups.map(bg => (
          <button
            key={bg}
            onClick={() => setBatchFilter(bg)}
            style={{
              fontSize: '9px',
              padding: '2px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: batchFilter === bg ? 'var(--accent-amber)' : 'var(--bg-secondary)',
              color: batchFilter === bg ? '#fff' : 'var(--text-secondary)',
              fontWeight: batchFilter === bg ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
          >
            {bg}
          </button>
        ))}
        {batchFilter !== 'all' && (
          <span style={{ fontSize: '8px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
            (Showing {batchFilter} only)
          </span>
        )}
      </div>

      {/* Settings Modal - Set Semester Start Date */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
            <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: '0 0 16px' }}>Semester Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="input-label">Semester Start Date</label>
                <input
                  type="date"
                  value={semesterStart}
                  onChange={(e) => saveSemesterStart(e.target.value)}
                  className="input"
                />
                <p style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  This sets when Week 1 begins. Adjust for semester breaks.
                </p>
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 4px' }}>Current Week {currentWeek} starts on:</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {new Date(semesterStart).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedTask(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '380px', 
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{selectedTask.title}</h3>
                {selectedTask.courseName && (
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-cyan)', margin: '4px 0 0' }}>{selectedTask.courseName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ 
                  border: 'none', 
                  background: 'var(--bg-input)', 
                  cursor: 'pointer', 
                  color: 'var(--text-secondary)', 
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedTask.courseCode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Course:</span>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent-cyan)', background: 'var(--accent-cyan-glow)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{selectedTask.courseCode}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Date:</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{selectedTask.date}</span>
              </div>
              {selectedTask.time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Time:</span>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{selectedTask.time}</span>
                </div>
              )}
              {selectedTask.batchGroup && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Batch:</span>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent-amber)', background: 'var(--accent-amber-glow)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{selectedTask.batchGroup}</span>
                </div>
              )}
              {selectedTask.syllabus && (
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Syllabus:</span>
                  <p style={{ 
                    fontSize: 'var(--fs-sm)', 
                    color: 'var(--text-primary)', 
                    background: 'var(--bg-input)', 
                    padding: '10px', 
                    borderRadius: 'var(--radius-md)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5'
                  }}>{selectedTask.syllabus}</p>
                </div>
              )}
              {selectedTask.crGroup && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>Posted by:</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-glow)', padding: '2px 8px', borderRadius: '4px' }}>{selectedTask.crGroup}</span>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)', display: 'flex', gap: '8px' }}>
              {canAddTask && (
                <button
                  onClick={() => { handleDeleteTask(selectedTask.id); setSelectedTask(null); }}
                  style={{ 
                    flex: 1,
                    padding: '8px',
                    background: 'var(--accent-rose-glow)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent-rose)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--fs-xs)',
                    fontWeight: 'bold'
                  }}
                >
                  Delete Task
                </button>
              )}
              <button
                onClick={() => setSelectedTask(null)}
                style={{ 
                  flex: 1,
                  padding: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--fs-xs)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && canAddTask && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '8px',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div 
            className="modal glass-card-static" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '320px', 
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              padding: '12px'
            }}
          >
            <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: '0 0 6px' }}>Add Task</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Course Code *</label>
                <CourseAutocomplete
                  value={newTask.courseCode}
                  onCourseSelect={handleCourseCodeSelect}
                  placeholder="Course code..."
                  type="code"
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Course Name</label>
                <input
                  type="text"
                  value={newTask.courseName}
                  onChange={(e) => setNewTask({ ...newTask, courseName: e.target.value })}
                  className="input"
                  placeholder="Auto-filled"
                  disabled
                  style={{ opacity: newTask.courseName ? 1 : 0.6, fontSize: 'var(--fs-xs)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  placeholder="Quiz -1"
                  required
                  style={{ fontSize: 'var(--fs-xs)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Syllabus</label>
                <textarea
                  value={newTask.syllabus}
                  onChange={(e) => setNewTask({ ...newTask, syllabus: e.target.value })}
                  className="input"
                  placeholder="Topics..."
                  rows={2}
                  style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 'var(--fs-xs)' }}
                />
              </div>
              <div className="grid-2" style={{ gap: '4px' }}>
                <div>
                  <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Date *</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    className="input"
                    required
                    style={{ fontSize: 'var(--fs-xs)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Time</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="input"
                    style={{ fontSize: 'var(--fs-xs)' }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                Batch: <strong style={{ color: 'var(--accent-amber)' }}>{userBatchGroup}</strong>
              </div>
              <div className="flex gap-2" style={{ marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary flex-1" style={{ fontSize: 'var(--fs-xs)', padding: '6px 8px' }}>Add</button>
                <button type="button" className="btn btn-secondary flex-1" style={{ fontSize: 'var(--fs-xs)', padding: '6px 8px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}