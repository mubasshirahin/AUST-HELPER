import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { useRoutine } from '../../context/RoutineContext';
import { normalizeAccentColor } from '../../utils/colorPalette';

// Parse time string like "08:00 - 08:50" or "08:00 AM - 08:50 AM" to minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  
  // Extract start time from the time range
  const parts = timeStr.split('-');
  const timePart = parts[0].trim();
  
  // Try to parse as 12-hour format first (e.g., "08:00 AM")
  const match12 = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    
    return hour * 60 + minute;
  }
  
  // Try 24-hour format (e.g., "08:00")
  const match24 = timePart.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    return hour * 60 + minute;
  }
  
  return null;
}

// Get end time from time string like "08:00 - 08:50"
function parseEndTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  
  const parts = timeStr.split('-');
  if (parts.length < 2) return null;
  
  const timePart = parts[1].trim();
  
  // Try to parse as 12-hour format first (e.g., "08:50 AM")
  const match12 = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    
    return hour * 60 + minute;
  }
  
  // Try 24-hour format (e.g., "08:50")
  const match24 = timePart.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    return hour * 60 + minute;
  }
  
  return null;
}

export default function RoutineCard() {
  const { routine, weekDays } = useRoutine();
  const [selectedDay, setSelectedDay] = useState(weekDays[0] || 'Saturday');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (weekDays && weekDays.length > 0 && !weekDays.includes(selectedDay)) {
      setSelectedDay(weekDays[0]);
    }
  }, [weekDays, selectedDay]);

  const classesForDay = useMemo(() => {
    return routine[selectedDay] || [];
  }, [selectedDay, routine]);

  // Calculate which class is "NOW" and which is "NEXT" based on actual time
  const { nowIndex, nextIndex } = useMemo(() => {
    let nowIdx = -1;
    let nextIdx = -1;
    
    // Only calculate for today
    if (selectedDay !== weekDays[0]) {
      return { nowIndex: -1, nextIndex: -1 };
    }
    
    const currentDay = currentTime.getDay();
    const dayIndex = weekDays.indexOf(selectedDay);
    
    // Check if we're viewing today's schedule
    if (dayIndex !== currentDay) {
      return { nowIndex: -1, nextIndex: -1 };
    }
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Find the class that is currently ongoing or about to start (within 1 hour)
    for (let i = 0; i < classesForDay.length; i++) {
      const cls = classesForDay[i];
      const startMinutes = parseTimeToMinutes(cls.time);
      const endMinutes = parseEndTimeToMinutes(cls.time);
      
      if (startMinutes === null || endMinutes === null) continue;
      
      // Check if class is currently ongoing
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        nowIdx = i;
        // Next class is the one after this
        if (i + 1 < classesForDay.length) {
          nextIdx = i + 1;
        }
        break;
      }
      
      // Check if class is upcoming (hasn't started yet but will start today)
      if (currentMinutes < startMinutes && nowIdx === -1) {
        // Check if we're within 1 hour of the class start
        if (startMinutes - currentMinutes <= 60) {
          // If the previous class has already ended, this is "NOW" (upcoming within 1 hour)
          if (i === 0) {
            // First class of the day, within 1 hour
            nowIdx = i;
            if (i + 1 < classesForDay.length) {
              nextIdx = i + 1;
            }
            break;
          } else {
            // Check if previous class has ended
            const prevEnd = parseEndTimeToMinutes(classesForDay[i - 1].time);
            if (prevEnd === null || currentMinutes > prevEnd) {
              nowIdx = i;
              if (i + 1 < classesForDay.length) {
                nextIdx = i + 1;
              }
              break;
            }
          }
        } else {
          // This is a future class, mark as next if no next found yet
          if (nextIdx === -1) {
            nextIdx = i;
          }
        }
      }
    }
    
    // If no "NOW" class found but we have a "NEXT", check if we should show NEXT
    // If all classes for today have ended, don't show NOW or NEXT
    if (nowIdx === -1 && nextIdx !== -1) {
      // Check if the next class is still in the future
      const nextClass = classesForDay[nextIdx];
      const nextStart = parseTimeToMinutes(nextClass.time);
      if (nextStart !== null && currentMinutes > nextStart + 60) {
        // The next class start time has passed by more than an hour, hide it
        nextIdx = -1;
      }
    }
    
    return { nowIndex: nowIdx, nextIndex: nextIdx };
  }, [selectedDay, weekDays, classesForDay, currentTime]);

  return (
    <div className="glass-card-static routine-card animate-fadeInUp">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Class Routine</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>AUST Semester Schedule</p>
          </div>
        </div>
      </div>

      <div className="tabs mb-4" style={{ display: 'flex', overflowX: 'auto', gap: '4px', padding: '4px' }}>
        {weekDays.map((day) => (
          <button
            key={day}
            className={`tab ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
            style={{ flex: 1, textAlign: 'center', minWidth: '80px' }}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="routine-list stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {classesForDay.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <p>No classes scheduled for {selectedDay}</p>
          </div>
        ) : (
          classesForDay.map((cls, idx) => {
            const isNow = idx === nowIndex;
            const isNext = idx === nextIndex;
            const accentColor = normalizeAccentColor(cls.color);

            return (
              <div
                key={cls.id}
                className="routine-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  borderLeft: `4px solid ${accentColor}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform var(--transition-base)',
                }}
              >
                {isNow && (
                  <span className="badge badge-rose" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '8px' }}>NOW</span>
                )}
                {isNext && (
                  <span className="badge badge-blue" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '8px' }}>NEXT</span>
                )}

                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)' }}>{cls.course}</span>
                    <span className="badge" style={{ backgroundColor: cls.type === 'Lab' ? 'var(--accent-purple-glow)' : 'var(--accent-blue-glow)', color: cls.type === 'Lab' ? 'var(--accent-purple)' : 'var(--accent-blue)', padding: '2px 6px', fontSize: '10px' }}>
                      {cls.type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)', margin: '4px 0' }}>{cls.name}</h4>
                  <div className="flex flex-wrap gap-4 mt-1 text-tertiary" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1"><Clock size={12} /> {cls.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> Room {cls.room}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {cls.teacher}</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
