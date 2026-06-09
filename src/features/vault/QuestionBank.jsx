import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';
import { questionBank } from '../../data/mockData';

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');

  // Unique course codes list
  const coursesList = useMemo(() => {
    const set = new Set(questionBank.map(q => q.course));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredItems = useMemo(() => {
    return questionBank.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'All' || item.type === selectedType;
      const matchCourse = selectedCourse === 'All' || item.course === selectedCourse;
      
      return matchSearch && matchType && matchCourse;
    });
  }, [searchTerm, selectedType, selectedCourse]);

  return (
    <div className="glass-card-static question-bank-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Master Question Bank</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Filters: Midterms, Finals, Quizzes & Solutions</p>
        </div>
      </div>

      {/* Filter and search panel */}
      <div className="flex justify-between gap-4 mb-6 flex-wrap">
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <input 
            type="text" 
            placeholder="Search questions by course code or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Course filter select */}
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: 'var(--fs-sm)',
              cursor: 'pointer'
            }}
          >
            {coursesList.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Courses' : c}</option>
            ))}
          </select>

          {/* Type filters */}
          <div className="flex gap-1" style={{ background: 'var(--bg-input)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            {['All', 'Mid', 'Final', 'Quiz'].map(t => (
              <button 
                key={t}
                onClick={() => setSelectedType(t)}
                className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 12px' }}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid-3">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'var(--bg-input)'
            }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="badge badge-purple" style={{ fontSize: '10px' }}>{item.course}</span>
                <span className="badge badge-blue" style={{ fontSize: '9px' }}>{item.year} - {item.semester}</span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 'var(--fw-bold)', margin: '8px 0' }}>{item.type} Term Exam Paper</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Total Questions: {item.questions}</p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-3" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              <div>
                {item.solved ? (
                  <span className="badge badge-emerald" style={{ fontSize: '8px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle size={10} /> SOLVED
                  </span>
                ) : (
                  <span className="badge badge-rose" style={{ fontSize: '8px', padding: '1px 6px' }}>PENDING</span>
                )}
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => alert(`Opening Question PDF: ${item.course} ${item.type} ${item.year}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
              >
                Download <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
