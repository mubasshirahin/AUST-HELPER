import React, { useState } from 'react';
import { CheckSquare, Square, RotateCcw } from 'lucide-react';
import { syllabusData } from '../../data/mockData';

export default function SyllabusProgress() {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('aust-syllabus-progress');
    return saved ? JSON.parse(saved) : syllabusData;
  });

  const saveCourses = (nextCourses) => {
    setCourses(nextCourses);
    localStorage.setItem('aust-syllabus-progress', JSON.stringify(nextCourses));
  };

  const toggleTopic = (courseCode, topicIdx) => {
    saveCourses(courses.map(c => {
      if (c.course === courseCode) {
        const updatedCompleted = [...c.completed];
        updatedCompleted[topicIdx] = !updatedCompleted[topicIdx];
        
        // Calculate new progress percentage
        const completedCount = updatedCompleted.filter(Boolean).length;
        const progress = Math.round((completedCount / c.topics.length) * 100);

        return {
          ...c,
          completed: updatedCompleted,
          progress
        };
      }
      return c;
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem('aust-syllabus-progress');
    setCourses(syllabusData);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'var(--accent-emerald)';
    if (progress >= 40) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="glass-card-static syllabus-progress-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Course Syllabus Progression</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Track and check off covered course materials</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={resetProgress}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid-2">
        {courses.map((course) => (
          <div 
            key={course.course}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            {/* Header info */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>{course.course}</span>
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: getProgressColor(course.progress) + '15', 
                    color: getProgressColor(course.progress),
                    fontWeight: 'bold',
                    fontSize: '11px'
                  }}
                >
                  {course.progress}%
                </span>
              </div>
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)', marginBottom: '8px' }}>{course.name}</h3>

              <div className="progress-bar mb-4">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${course.progress}%`,
                    background: getProgressColor(course.progress)
                  }}
                />
              </div>

              {/* Topics checkboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {course.topics.map((topic, idx) => {
                  const isCompleted = course.completed[idx];
                  return (
                    <div 
                      key={topic} 
                      onClick={() => toggleTopic(course.course, idx)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        fontSize: '12px', 
                        color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {isCompleted ? (
                        <CheckSquare size={16} style={{ color: getProgressColor(course.progress) }} />
                      ) : (
                        <Square size={16} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{topic}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
