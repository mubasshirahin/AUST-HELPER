import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, BookOpen } from 'lucide-react';
import { cheatsheets } from '../../data/mockData';

const categoryColors = {
  'Programming': '#a855f7',
  'Data Structures': '#3b82f6',
  'Object-Oriented': '#f59e0b',
  'Algorithms': '#10b981',
  'Operating Systems': '#ef4444',
  'Database': '#06b6d4',
  'Networks': '#f97316',
  'Software Engineering': '#8b5cf6',
  'AI': '#ec4899',
  'Machine Learning': '#14b8a6',
  'Mathematics': '#6366f1',
  'Circuit Analysis': '#ff5722',
  'Electronics': '#e91e63',
  'Digital Electronics': '#009688',
  'Power Engineering': '#795548',
  'Structural Analysis': '#3f51b5',
  'Fluid Mechanics': '#00bcd4',
  'Geotechnical': '#4caf50',
  'Structural Design': '#ff9800',
  'Transportation': '#607d8b',
  'Thermodynamics': '#f44336',
  'Machine Design': '#9c27b0',
  'Manufacturing': '#673ab7',
  'Operations Research': '#cddc39',
  'Quality Control': '#8bc34a',
  'Production Management': '#03a9f4',
  'Supply Chain': '#ffc107',
  'Fiber & Yarn': '#ff4081',
  'Fabric Manufacturing': '#7c4dff',
  'Wet Processing': '#448aff',
  'Garments': '#69f0ae',
  'Building Design': '#bdbdbd',
  'Drawing & Graphics': '#ffab40',
  'Structures': '#536dfe',
  'Urban Planning': '#ff6e40',
  'Accounting': '#4db6ac',
  'Marketing': '#ff8a65',
  'HRM': '#7986cb',
  'Economics': '#aed581',
  'Finance': '#4dd0e1',
  'Physics': '#5c6bc0',
  'Chemistry': '#26a69a',
  'English': '#ef5350',
  'Humanities': '#ab47bc',
};

const deptMeta = {
  CSE:  { label: 'CSE',  full: 'Computer Science & Engineering',      color: '#a855f7', icon: '💻' },
  EEE:  { label: 'EEE',  full: 'Electrical & Electronic Engineering',  color: '#ff5722', icon: '⚡' },
  CE:   { label: 'CE',   full: 'Civil Engineering',                    color: '#3f51b5', icon: '🏗️' },
  ME:   { label: 'ME',   full: 'Mechanical Engineering',               color: '#f44336', icon: '⚙️' },
  IPE:  { label: 'IPE',  full: 'Industrial & Production Engineering',  color: '#9c27b0', icon: '🏭' },
  TE:   { label: 'TE',   full: 'Textile Engineering',                  color: '#ff4081', icon: '🧵' },
  ARCH: { label: 'ARCH', full: 'Architecture',                         color: '#ff9800', icon: '🏛️' },
  BBA:  { label: 'BBA',  full: 'Business Administration',              color: '#4db6ac', icon: '📊' },
};

const commonMeta = {
  PHY:  { label: 'PHY',  full: 'Physics',          color: '#5c6bc0', icon: '🔬' },
  CHEM: { label: 'CHEM', full: 'Chemistry',        color: '#26a69a', icon: '🧪' },
  MATH: { label: 'MATH', full: 'Mathematics',      color: '#6366f1', icon: '📐' },
  ENG:  { label: 'ENG',  full: 'English',          color: '#ef5350', icon: '📝' },
  HUM:  { label: 'HUM',  full: 'Humanities',       color: '#ab47bc', icon: '📖' },
};

const allDepts = { ...deptMeta, ...commonMeta };

const courseMap = {
  CSE1101: 'Intro to Programming',
  CSE1201: 'Data Structures',
  CSE2101: 'Object-Oriented Programming',
  CSE2201: 'Algorithms',
  CSE3001: 'Operating Systems',
  CSE3101: 'Database Systems',
  CSE3103: 'Computer Networks',
  CSE3111: 'Software Engineering',
  CSE4103: 'Artificial Intelligence',
  CSE4201: 'Machine Learning',
  MATH2201: 'Probability & Statistics',
  EEE: 'Electrical & Electronic Engineering',
  CE: 'Civil Engineering',
  ME: 'Mechanical Engineering',
  IPE: 'Industrial & Production Engineering',
  TE: 'Textile Engineering',
  ARCH: 'Architecture',
  BBA: 'Business Administration',
  PHY: 'Physics',
  CHEM: 'Chemistry',
  MATH: 'Mathematics',
  ENG: 'English',
  HUM: 'Humanities',
};

export default function Cheatsheets({ vaultContext }) {
  const { course, courseName } = vaultContext;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const allDeptKeys = Object.keys(allDepts);
  const [mainDeptKeys, commonDeptKeys] = useMemo(() => {
    const main = Object.keys(deptMeta);
    const common = Object.keys(commonMeta);
    return [main, common];
  }, []);

  const filteredByDept = useMemo(() => {
    return activeDept === 'All'
      ? cheatsheets
      : cheatsheets.filter(cs => cs.course?.startsWith(activeDept));
  }, [activeDept]);

  const availableCategories = useMemo(() => {
    const cats = [...new Set(filteredByDept.map(cs => cs.category))];
    return ['All', ...cats.sort()];
  }, [filteredByDept]);

  const filteredCheatsheets = useMemo(() => {
    return filteredByDept
      .filter(cs => !course || !cs.course || cs.course === course)
      .filter(cs => activeCategory === 'All' || cs.category === activeCategory)
      .filter(cs =>
        !searchTerm.trim() ||
        cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cs.course && cs.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cs.formulas.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [filteredByDept, course, activeCategory, searchTerm]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="glass-card-static cheatsheets-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Cheatsheets</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — quick formula sheets and references
          </p>
        </div>
        <div className="search-box" style={{ width: '240px' }}>
          <input
            type="text"
            placeholder="Search cheatsheets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Department filter */}
      <div className="mb-5">
        <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Department
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
          <button
            onClick={() => { setActiveDept('All'); setActiveCategory('All'); }}
            className={`tag ${activeDept === 'All' ? 'active' : ''}`}
            style={{ fontSize: '11px', flexShrink: 0 }}
          >
            All Departments
          </button>
          {mainDeptKeys.map(dk => {
            const m = allDepts[dk];
            const active = activeDept === dk;
            return (
              <button
                key={dk}
                onClick={() => { setActiveDept(dk); setActiveCategory('All'); }}
                style={{
                  fontSize: '11px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? `1.5px solid ${m.color}` : '1.5px solid transparent',
                  background: active ? m.color + '18' : 'var(--bg-secondary)',
                  color: active ? m.color : 'var(--text-secondary)',
                  fontWeight: active ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 flex-wrap">
          {commonDeptKeys.map(dk => {
            const m = allDepts[dk];
            const active = activeDept === dk;
            return (
              <button
                key={dk}
                onClick={() => { setActiveDept(dk); setActiveCategory('All'); }}
                style={{
                  fontSize: '10px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? `1.5px solid ${m.color}` : '1.5px solid transparent',
                  background: active ? m.color + '18' : 'var(--bg-secondary)',
                  color: active ? m.color : 'var(--text-tertiary)',
                  fontWeight: active ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {m.icon} {m.full}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter chips */}
      {filteredByDept.length > 0 && (
        <div className="mb-5">
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Topic
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tag ${activeCategory === cat ? 'active' : ''}`}
                style={{
                  textTransform: 'capitalize',
                  fontSize: '11px',
                  border: activeCategory === cat
                    ? `1.5px solid ${categoryColors[cat] || 'var(--accent-purple)'}`
                    : '1.5px solid transparent',
                }}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredCheatsheets.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <BookOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            {searchTerm
              ? 'No cheatsheets match your search.'
              : `No cheatsheets available for ${courseName} yet.`}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredCheatsheets.map(cs => {
            const catColor = categoryColors[cs.category] || 'var(--accent-purple)';
            const dept = cs.course && allDepts[cs.course];
            return (
              <div
                key={cs.id}
                className="glass-card"
                style={{
                  padding: '0',
                  background: 'var(--bg-input)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 'var(--fw-bold)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {cs.title}
                    </h3>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {dept ? `${dept.icon} ${dept.full}` : (cs.course && courseMap[cs.course] ? `${cs.course} — ${courseMap[cs.course]}` : '')}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '600',
                      background: catColor + '20',
                      color: catColor,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {cs.category}
                  </span>
                </div>

                {/* Formula list */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {cs.formulas.map((formula, idx) => {
                    const uid = `${cs.id}-${idx}`;
                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <code
                          style={{
                            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                            fontSize: '11px',
                            color: 'var(--accent-cyan)',
                            wordBreak: 'break-all',
                            lineHeight: '1.5',
                            flex: 1,
                          }}
                        >
                          {formula}
                        </code>
                        <button
                          className="btn-ghost"
                          onClick={() => handleCopy(formula, uid)}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '4px',
                            flexShrink: 0,
                            color: copiedId === uid ? 'var(--accent-emerald)' : 'var(--text-tertiary)',
                            transition: 'color 0.15s ease',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copy"
                        >
                          {copiedId === uid ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
