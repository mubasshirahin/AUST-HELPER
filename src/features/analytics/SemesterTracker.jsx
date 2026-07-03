import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Trash2, AlertCircle, BookOpen, FlaskConical,
  Plus, X, Check, Settings2, ChevronRight, RotateCcw, Info
} from 'lucide-react';
import { useRoutine } from '../../context/RoutineContext';
import { findCourseByCode } from '../../data/courses';
import { getUserStorageItem, setUserStorageItem } from '../../utils/authStorage';
import './SemesterTracker.css';

const THEORY_COURSES_KEY = 'semesterTrackerCourses';
const THEORY_MARKS_KEY  = 'semesterTrackerMarks';
const LAB_COURSES_KEY   = 'semesterTrackerLabCourses';
const LAB_CONFIG_KEY    = 'semesterTrackerLabConfig';
const LAB_MARKS_KEY     = 'semesterTrackerLabMarks';

/* ─── Theory mark fields (fixed) ─── */
const THEORY_FIELDS = [
  { id: 'attendance', label: 'Attend.', fullLabel: 'Attendance', maxMarks: 10, color: 'var(--accent-emerald)' },
  { id: 'quiz1',      label: 'Quiz 1',  fullLabel: 'Quiz 1',     maxMarks: 10, color: 'var(--accent-cyan)'    },
  { id: 'quiz2',      label: 'Quiz 2',  fullLabel: 'Quiz 2',     maxMarks: 10, color: 'var(--accent-cyan)'    },
  { id: 'quiz3',      label: 'Quiz 3',  fullLabel: 'Quiz 3',     maxMarks: 10, color: 'var(--accent-cyan)'    },
  { id: 'midterm',    label: 'Midterm', fullLabel: 'Midterm',    maxMarks: 20, color: 'var(--accent-amber)'   },
  { id: 'final',      label: 'Final',   fullLabel: 'Final Exam', maxMarks: 50, color: 'var(--accent-rose)'    },
];

/* ─── Lab component types ─── */
const LAB_TYPES = [
  { type: 'online',       label: 'Online',       icon: '🌐' },
  { type: 'offline',      label: 'Offline',      icon: '📝' },
  { type: 'assignment',   label: 'Assignment',   icon: '📋' },
  { type: 'lab_report',   label: 'Lab Report',   icon: '📄' },
  { type: 'lab_mid',      label: 'Lab Mid',      icon: '📊' },
  { type: 'lab_final',    label: 'Lab Final',    icon: '🎯' },
  { type: 'presentation', label: 'Presentation', icon: '🎤' },
  { type: 'attendance',   label: 'Attendance',   icon: '✅' },
  { type: 'viva',         label: 'Viva',         icon: '🗣️'  },
  { type: 'project',      label: 'Project',      icon: '🛠️'  },
  { type: 'homework',     label: 'Homework',     icon: '🏠' },
  { type: 'custom',       label: 'Custom',       icon: '✏️'  },
];

/* ─── Helpers ─── */
function getGrade(total) {
  if (total >= 80) return { letter: 'A+', gpa: '4.00', color: 'var(--accent-emerald)' };
  if (total >= 75) return { letter: 'A',  gpa: '3.75', color: 'var(--accent-emerald)' };
  if (total >= 70) return { letter: 'A-', gpa: '3.50', color: 'var(--accent-cyan)'    };
  if (total >= 65) return { letter: 'B+', gpa: '3.25', color: 'var(--accent-cyan)'    };
  if (total >= 60) return { letter: 'B',  gpa: '3.00', color: 'var(--accent-blue)'    };
  if (total >= 55) return { letter: 'B-', gpa: '2.75', color: 'var(--accent-amber)'   };
  if (total >= 50) return { letter: 'C+', gpa: '2.50', color: 'var(--accent-amber)'   };
  if (total >= 45) return { letter: 'C',  gpa: '2.25', color: 'var(--accent-orange)'  };
  if (total >= 40) return { letter: 'D',  gpa: '2.00', color: 'var(--accent-rose)'    };
  return             { letter: 'F',  gpa: '0.00', color: 'var(--danger)'           };
}

function getCellClass(value, max) {
  if (value === undefined || value === '') return '';
  const pct = value / max;
  if (pct >= 0.8) return 'cell-green';
  if (pct >= 0.6) return 'cell-yellow';
  return 'cell-red';
}

/* Expand lab config into flat column list */
function expandLabColumns(config) {
  if (!config?.components?.length) return [];
  const cols = [];
  config.components.forEach((comp, ci) => {
    // marksEach = totalMarks ÷ count (auto-calculated)
    const marksEach = comp.totalMarks / comp.count;
    for (let i = 0; i < comp.count; i++) {
      cols.push({
        key: `${comp.type}_${ci}_${i}`,
        label: comp.count > 1 ? `${comp.label} ${i + 1}` : comp.label,
        max: marksEach,
        compIdx: ci,
        itemIdx: i,
        color: LAB_TYPES.find(t => t.type === comp.type)?.color || 'var(--text-secondary)',
      });
    }
  });
  return cols;
}

/* ══════════════════════════════════════════
   Main Component
═══════════════════════════════════════════ */
export default function SemesterTracker() {
  /* ── Theory state ── */
  const [theoryCourses, setTheoryCourses] = useState(() => getUserStorageItem(THEORY_COURSES_KEY) || []);
  const [theoryMarks,   setTheoryMarks]   = useState(() => getUserStorageItem(THEORY_MARKS_KEY)   || {});

  /* ── Lab state ── */
  const [labCourses, setLabCourses] = useState(() => getUserStorageItem(LAB_COURSES_KEY) || []);
  const [labConfig,  setLabConfig]  = useState(() => getUserStorageItem(LAB_CONFIG_KEY)  || {}); // { [courseId]: { components: [...] } }
  const [labMarks,   setLabMarks]   = useState(() => getUserStorageItem(LAB_MARKS_KEY)   || {}); // { [courseId]: { [colKey]: value } }

  /* ── Setup wizard state ── */
  const [setupCourseId, setSetupCourseId] = useState(null); // which course is being configured
  const [draftComponents, setDraftComponents] = useState([]);

  /* ── Active cell ── */
  const [activeCell, setActiveCell] = useState(null);
  const inputRefs = useRef({});

  const { routine } = useRoutine();

  /* ── Persist theory ── */
  useEffect(() => { setUserStorageItem(THEORY_COURSES_KEY, theoryCourses); }, [theoryCourses]);
  useEffect(() => { setUserStorageItem(THEORY_MARKS_KEY,   theoryMarks);   }, [theoryMarks]);

  /* ── Persist lab ── */
  useEffect(() => { setUserStorageItem(LAB_COURSES_KEY, labCourses); }, [labCourses]);
  useEffect(() => { setUserStorageItem(LAB_CONFIG_KEY,  labConfig);  }, [labConfig]);
  useEffect(() => { setUserStorageItem(LAB_MARKS_KEY,   labMarks);   }, [labMarks]);

  /* ── Auto-add courses from routine ── */
  useEffect(() => {
    const all = Object.values(routine || {}).flat();

    const uniqueBy = (arr, key) =>
      arr.filter((item, idx, self) => self.findIndex(i => i[key] === item[key]) === idx);

    const theoryItems = uniqueBy(all.filter(c => c.type === 'Theory'), 'course');
    const labItems    = uniqueBy(all.filter(c => c.type === 'Lab' || c.type === 'Sessional'), 'course');

    const makeCourse = (rc) => {
      const found = findCourseByCode(rc.course);
      return { id: rc.course, code: rc.course, name: found ? found.name : rc.name || 'Unknown Course' };
    };

    setTheoryCourses(prev => {
      const fresh = theoryItems.filter(rc => !prev.some(c => c.code === rc.course)).map(makeCourse);
      return fresh.length ? [...prev, ...fresh] : prev;
    });

    setLabCourses(prev => {
      const fresh = labItems.filter(rc => !prev.some(c => c.code === rc.course)).map(makeCourse);
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [routine]);

  /* ════════════════════
     THEORY LOGIC
  ════════════════════ */
  const theoryBestTwo = (cid) => {
    const m = theoryMarks[cid] || {};
    return [...[m.quiz1||0, m.quiz2||0, m.quiz3||0].sort((a,b)=>b-a)].slice(0,2).reduce((s,v)=>s+v,0);
  };
  const theoryTotal = (cid) => {
    const m = theoryMarks[cid] || {};
    return (m.attendance||0) + theoryBestTwo(cid) + (m.midterm||0) + (m.final||0);
  };
  const handleTheoryMark = (cid, fid, val) => {
    const max = THEORY_FIELDS.find(f=>f.id===fid)?.maxMarks || 0;
    const num = parseFloat(val);
    setTheoryMarks(prev => ({
      ...prev, [cid]: { ...prev[cid], [fid]: isNaN(num) ? undefined : Math.max(0, Math.min(max, num)) }
    }));
  };
  const removeTheoryCourse = (id) => {
    if (!window.confirm('Remove this course?')) return;
    setTheoryCourses(p => p.filter(c=>c.id!==id));
    setTheoryMarks(p => { const n={...p}; delete n[id]; return n; });
  };

  /* ════════════════════
     LAB SETUP WIZARD
  ════════════════════ */
  const openSetup = (courseId) => {
    const existing = labConfig[courseId];
    setDraftComponents(existing?.components ? [...existing.components] : []);
    setSetupCourseId(courseId);
  };

  const addDraftComponent = (type) => {
    const meta = LAB_TYPES.find(t=>t.type===type);
    if (type === 'custom') {
      setDraftComponents(p => [...p, { type:'custom', label:'', count:'', totalMarks:'' }]);
    } else {
      // avoid duplicate non-custom
      if (draftComponents.some(c=>c.type===type && c.type!=='custom')) return;
      setDraftComponents(p => [...p, { type, label: meta.label, count:'', totalMarks:'' }]);
    }
  };

  const updateDraft = (idx, field, value) => {
    // If it's a numeric field, we allow empty string but otherwise parse it
    let finalVal = value;
    if ((field === 'count' || field === 'totalMarks') && value !== '') {
      finalVal = parseFloat(value);
      if (isNaN(finalVal)) finalVal = '';
    }
    setDraftComponents(p => p.map((c,i) => i===idx ? {...c, [field]: finalVal} : c));
  };

  const removeDraft = (idx) => {
    setDraftComponents(p => p.filter((_,i)=>i!==idx));
  };

  const saveLabSetup = () => {
    const valid = draftComponents.filter(c => c.label.trim() && c.count >= 1 && c.totalMarks > 0);
    if (!valid.length) { alert('Add at least one valid component with total marks > 0.'); return; }
    setLabConfig(prev => ({ ...prev, [setupCourseId]: { components: valid } }));
    setSetupCourseId(null);
    setDraftComponents([]);
  };

  const resetLabSetup = (courseId) => {
    if (!window.confirm('Reset this lab setup? All marks will be cleared.')) return;
    setLabConfig(prev => { const n={...prev}; delete n[courseId]; return n; });
    setLabMarks(prev  => { const n={...prev}; delete n[courseId]; return n; });
  };

  /* ── Lab marks ── */
  const handleLabMark = (cid, colKey, val, max) => {
    const num = parseFloat(val);
    setLabMarks(prev => ({
      ...prev,
      [cid]: { ...prev[cid], [colKey]: isNaN(num) ? undefined : Math.max(0, Math.min(max, num)) }
    }));
  };

  const labTotal = (cid, cols) =>
    cols.reduce((sum, col) => sum + (labMarks[cid]?.[col.key] || 0), 0);

  const removeLabCourse = (id) => {
    if (!window.confirm('Remove this lab course?')) return;
    setLabCourses(p=>p.filter(c=>c.id!==id));
    setLabConfig(p=>{ const n={...p}; delete n[id]; return n; });
    setLabMarks(p=>{ const n={...p}; delete n[id]; return n; });
  };

  /* ── Keyboard nav ── */
  const handleKeyDown = (e, courses, courseIdx, fieldIdx, fieldCount, prefix) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextF = e.shiftKey ? fieldIdx-1 : fieldIdx+1;
      if (nextF>=0 && nextF<fieldCount) {
        inputRefs.current[`${prefix}_${courses[courseIdx].id}_${nextF}`]?.focus();
      } else if (!e.shiftKey && courseIdx+1<courses.length) {
        inputRefs.current[`${prefix}_${courses[courseIdx+1].id}_0`]?.focus();
      }
    }
    if (e.key==='ArrowDown' && courseIdx+1<courses.length)
      inputRefs.current[`${prefix}_${courses[courseIdx+1].id}_${fieldIdx}`]?.focus();
    if (e.key==='ArrowUp' && courseIdx-1>=0)
      inputRefs.current[`${prefix}_${courses[courseIdx-1].id}_${fieldIdx}`]?.focus();
  };

  const totalPossibleLab = (config) =>
    // totalMarks is what the user entered as the total for each component
    (config?.components||[]).reduce((s,c)=>s+(c.totalMarks||0),0);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="st-wrapper animate-fadeInUp">

      {/* ══════════════════════════════
          THEORY SECTION
      ══════════════════════════════ */}
      <div className="st-section-header">
        <div className="st-section-icon theory-icon"><BookOpen size={16}/></div>
        <div>
          <h2 className="st-section-title">Theory Courses</h2>
          <p className="st-section-sub">
            Fixed distribution · Attend 10 · Quiz 10×3 (best 2) · Midterm 20 · Final 50
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="st-legend">
        <div className="st-legend-item"><span className="st-legend-dot" style={{background:'var(--accent-emerald)'}}/>≥80%</div>
        <div className="st-legend-item"><span className="st-legend-dot" style={{background:'var(--accent-amber)'}}/>60–79%</div>
        <div className="st-legend-item"><span className="st-legend-dot" style={{background:'var(--accent-rose)'}}/>{'<60%'}</div>
        <div className="st-legend-sep">|</div>
        <div className="st-legend-item"><Info size={11} style={{opacity:0.5}}/> Best 2 of 3 Quizzes count</div>
      </div>

      {theoryCourses.length === 0 ? (
        <div className="st-empty">
          <AlertCircle size={38} className="st-empty-icon"/>
          <h3>No Theory Courses</h3>
          <p>Theory courses from your routine will appear here automatically.</p>
        </div>
      ) : (
        <div className="st-table-scroll">
          <table className="st-table">
            <thead>
              <tr>
                <th className="st-th st-th-course">Course</th>
                {THEORY_FIELDS.map(f=>(
                  <th key={f.id} className="st-th st-th-mark" style={{'--col-color':f.color}}>
                    <div className="st-th-inner">
                      <span className="st-th-label">{f.label}</span>
                      <span className="st-th-max">/{f.maxMarks}</span>
                    </div>
                  </th>
                ))}
                <th className="st-th st-th-best2">Best 2<br/><span className="st-th-sub">/20</span></th>
                <th className="st-th st-th-total">Total<br/><span className="st-th-sub">/100</span></th>
                <th className="st-th st-th-grade">Grade</th>
                <th className="st-th st-th-action"/>
              </tr>
            </thead>
            <tbody>
              {theoryCourses.map((course, cIdx)=>{
                const m = theoryMarks[course.id] || {};
                const b2 = theoryBestTwo(course.id);
                const tot = theoryTotal(course.id);
                const grade = getGrade(tot);
                const hasAny = THEORY_FIELDS.some(f=>m[f.id]!==undefined);
                return (
                  <tr key={course.id} className="st-row">
                    <td className="st-td st-td-course">
                      <span className="st-course-code">{course.code}</span>
                      <span className="st-course-name">{course.name}</span>
                    </td>
                    {THEORY_FIELDS.map((field,fIdx)=>{
                      const val = m[field.id];
                      const isActive = activeCell?.key===`t_${course.id}_${fIdx}`;
                      return (
                        <td key={field.id}
                          className={`st-td st-td-input ${getCellClass(val,field.maxMarks)} ${isActive?'st-td-active':''}`}
                          style={{'--col-color':field.color}}
                        >
                          <input
                            ref={el=>inputRefs.current[`t_${course.id}_${fIdx}`]=el}
                            type="number" min="0" max={field.maxMarks} step="0.5"
                            value={val??''} placeholder="—"
                            className="st-cell-input"
                            onFocus={()=>setActiveCell({key:`t_${course.id}_${fIdx}`})}
                            onBlur={()=>setActiveCell(null)}
                            onChange={e=>handleTheoryMark(course.id,field.id,e.target.value)}
                            onKeyDown={e=>handleKeyDown(e,theoryCourses,cIdx,fIdx,THEORY_FIELDS.length,'t')}
                          />
                        </td>
                      );
                    })}
                    {/* Best 2 */}
                    <td className="st-td st-td-computed">
                      <span className={`st-computed-val ${getCellClass(b2,20)}`}>{b2>0?b2:'—'}</span>
                    </td>
                    {/* Total */}
                    <td className="st-td st-td-total-cell">
                      <div className="st-total-wrap">
                        <span className="st-total-val" style={{color:hasAny?grade.color:'var(--text-tertiary)'}}>
                          {hasAny?tot.toFixed(1):'—'}
                        </span>
                        {hasAny&&(
                          <div className="st-total-bar">
                            <div className="st-total-bar-fill" style={{width:`${tot}%`,background:grade.color}}/>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Grade */}
                    <td className="st-td st-td-grade">
                      {hasAny?(
                        <div className="st-grade-badge" style={{'--grade-color':grade.color}}>
                          <span className="st-grade-letter">{grade.letter}</span>
                          <span className="st-grade-gpa">{grade.gpa}</span>
                        </div>
                      ):<span className="st-nil">—</span>}
                    </td>
                    <td className="st-td st-td-del">
                      <button className="st-del-btn" onClick={()=>removeTheoryCourse(course.id)} title="Remove">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Keyboard hint */}
      {theoryCourses.length>0&&(
        <p className="st-keyboard-hint">
          💡 <kbd>Tab</kbd> / <kbd>↑↓</kbd> to navigate cells
        </p>
      )}

      {/* ══════════════════════════════
          LAB SECTION
      ══════════════════════════════ */}
      <div className="st-divider"/>

      <div className="st-section-header">
        <div className="st-section-icon lab-icon"><FlaskConical size={16}/></div>
        <div>
          <h2 className="st-section-title">Lab Courses</h2>
          <p className="st-section-sub">
            Configure mark distribution per lab — then enter marks in the table
          </p>
        </div>
      </div>

      {labCourses.length === 0 ? (
        <div className="st-empty">
          <AlertCircle size={38} className="st-empty-icon"/>
          <h3>No Lab Courses</h3>
          <p>Lab / Sessional courses from your routine will appear here.</p>
        </div>
      ) : (
        <div className="st-lab-list">
          {labCourses.map(course=>{
            const config  = labConfig[course.id];
            const cols    = config ? expandLabColumns(config) : [];
            const maxTot  = totalPossibleLab(config);
            const lMarks  = labMarks[course.id] || {};
            const tot     = labTotal(course.id, cols);
            const pct     = maxTot ? (tot/maxTot)*100 : 0;
            const grade   = getGrade(pct);
            const hasAny  = cols.some(c=>lMarks[c.key]!==undefined);
            const isSetup = setupCourseId === course.id;

            return (
              <div key={course.id} className="st-lab-card">
                {/* ─ Card Header ─ */}
                <div className="st-lab-card-header">
                  <div className="st-lab-title-row">
                    <div>
                      <span className="st-course-code">{course.code}</span>
                      <span className="st-course-name" style={{marginLeft:'10px'}}>{course.name}</span>
                    </div>
                    <div className="st-lab-header-actions">
                      {config && (
                        <button className="st-icon-btn" onClick={()=>resetLabSetup(course.id)} title="Reset setup">
                          <RotateCcw size={13}/>
                        </button>
                      )}
                      <button
                        className={`st-icon-btn ${isSetup?'active':''}`}
                        onClick={()=> isSetup ? setSetupCourseId(null) : openSetup(course.id)}
                        title={config?'Edit setup':'Configure marks'}
                      >
                        <Settings2 size={13}/>
                        <span style={{fontSize:'0.65rem',marginLeft:'3px'}}>
                          {config ? 'Edit Setup' : 'Setup Marks'}
                        </span>
                      </button>
                      <button className="st-del-btn always-show" onClick={()=>removeLabCourse(course.id)} title="Remove">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>

                  {/* Total bar (if configured) */}
                  {config && hasAny && (
                    <div className="st-lab-progress-row">
                      <div className="st-total-bar" style={{flex:1}}>
                        <div className="st-total-bar-fill" style={{width:`${pct}%`,background:grade.color}}/>
                      </div>
                      <span style={{fontSize:'var(--fs-xs)',color:grade.color,fontWeight:700,minWidth:'90px',textAlign:'right'}}>
                        {tot.toFixed(1)}/{maxTot} ({pct.toFixed(1)}%)
                      </span>
                      <div className="st-grade-badge" style={{'--grade-color':grade.color}}>
                        <span className="st-grade-letter">{grade.letter}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─ Setup Wizard ─ */}
                {isSetup && (
                  <div className="st-setup-panel">
                    <p className="st-setup-heading">
                      Select components → set count &amp; total marks → per-item calculated automatically:
                    </p>

                    {/* Type picker */}
                    <div className="st-type-grid">
                      {LAB_TYPES.map(lt=>{
                        const already = draftComponents.some(c=>c.type===lt.type && lt.type!=='custom');
                        return (
                          <button
                            key={lt.type}
                            className={`st-type-btn ${already?'active':''}`}
                            onClick={()=>addDraftComponent(lt.type)}
                            title={already && lt.type!=='custom' ? 'Already added' : ''}
                          >
                            <span>{lt.icon}</span>
                            <span>{lt.label}</span>
                            {already && lt.type!=='custom' && <Check size={10} className="st-type-check"/>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Draft component rows */}
                    {draftComponents.length > 0 && (
                      <div className="st-draft-list">
                        <div className="st-draft-header-row">
                          <span style={{flex:2}}>Component</span>
                          <span style={{flex:1,textAlign:'center'}}>Count</span>
                          <span style={{flex:1,textAlign:'center'}}>Total Marks</span>
                          <span style={{flex:1,textAlign:'center'}}>Per Item</span>
                          <span style={{width:'28px'}}/>
                        </div>
                        {draftComponents.map((comp,idx)=>{
                          const perItem = comp.count > 0 ? (comp.totalMarks / comp.count) : 0;
                          return (
                          <div key={idx} className="st-draft-row">
                            {/* Label */}
                            {comp.type==='custom' ? (
                              <input
                                className="st-draft-input st-draft-label"
                                placeholder="Type label..."
                                value={comp.label}
                                onChange={e=>updateDraft(idx,'label',e.target.value)}
                              />
                            ):(
                              <span className="st-draft-label-text">
                                {LAB_TYPES.find(t=>t.type===comp.type)?.icon} {comp.label}
                              </span>
                            )}
                            {/* Count */}
                            <input
                              type="number" min="1" max="20"
                              className="st-draft-input st-draft-num"
                              value={comp.count}
                              placeholder="1"
                              onChange={e=>updateDraft(idx,'count',e.target.value)}
                            />
                            {/* Total Marks (user enters this) */}
                            <input
                              type="number" min="1" max="500"
                              className="st-draft-input st-draft-num"
                              value={comp.totalMarks}
                              placeholder="10"
                              onChange={e=>updateDraft(idx,'totalMarks',e.target.value)}
                            />
                            {/* Per Item (auto-calculated) */}
                            <span className="st-draft-sub" title={`${comp.totalMarks} ÷ ${comp.count}`}>
                              {Number.isInteger(perItem) ? perItem : perItem.toFixed(2)}
                            </span>
                            {/* Remove */}
                            <button className="st-icon-btn danger" onClick={()=>removeDraft(idx)}>
                              <X size={12}/>
                            </button>
                          </div>
                          );
                        })}
                        <div className="st-draft-total-row">
                          <span>Grand Total</span>
                          <span style={{color:'var(--accent-amber)',fontWeight:700}}>
                            {draftComponents.reduce((s,c)=>s+(c.totalMarks||0),0)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="st-setup-actions">
                      <button className="btn btn-secondary btn-sm" onClick={()=>{setSetupCourseId(null);setDraftComponents([]);}}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={saveLabSetup} disabled={!draftComponents.length}>
                        <Check size={13}/> Save Setup
                      </button>
                    </div>
                  </div>
                )}

                {/* ─ Lab Marks Table ─ */}
                {config && !isSetup && cols.length > 0 && (
                  <div className="st-table-scroll" style={{marginTop:'12px'}}>
                    <table className="st-table">
                      <thead>
                        <tr>
                          {cols.map(col=>(
                            <th key={col.key} className="st-th st-th-mark" style={{'--col-color':'var(--accent-cyan)'}}>
                              <div className="st-th-inner">
                                <span className="st-th-label" style={{fontSize:'0.6rem'}}>{col.label}</span>
                                <span className="st-th-max">/{col.max}</span>
                              </div>
                            </th>
                          ))}
                          <th className="st-th st-th-total">Total<br/><span className="st-th-sub">/{maxTot}</span></th>
                          <th className="st-th st-th-grade">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="st-row">
                          {cols.map((col,fIdx)=>{
                            const val = lMarks[col.key];
                            const isActive = activeCell?.key===`l_${course.id}_${fIdx}`;
                            return (
                              <td key={col.key}
                                className={`st-td st-td-input ${getCellClass(val,col.max)} ${isActive?'st-td-active':''}`}
                                style={{'--col-color':'var(--accent-cyan)'}}
                              >
                                <input
                                  ref={el=>inputRefs.current[`l_${course.id}_${fIdx}`]=el}
                                  type="number" min="0" max={col.max} step="0.5"
                                  value={val??''} placeholder="—"
                                  className="st-cell-input"
                                  onFocus={()=>setActiveCell({key:`l_${course.id}_${fIdx}`})}
                                  onBlur={()=>setActiveCell(null)}
                                  onChange={e=>handleLabMark(course.id,col.key,e.target.value,col.max)}
                                  onKeyDown={e=>handleKeyDown(e,[course],0,fIdx,cols.length,'l')}
                                />
                              </td>
                            );
                          })}
                          {/* Total */}
                          <td className="st-td st-td-total-cell">
                            <div className="st-total-wrap">
                              <span className="st-total-val" style={{color:hasAny?grade.color:'var(--text-tertiary)'}}>
                                {hasAny?tot.toFixed(1):'—'}
                              </span>
                              {hasAny&&(
                                <div className="st-total-bar">
                                  <div className="st-total-bar-fill" style={{width:`${pct}%`,background:grade.color}}/>
                                </div>
                              )}
                            </div>
                          </td>
                          {/* Grade */}
                          <td className="st-td st-td-grade">
                            {hasAny?(
                              <div className="st-grade-badge" style={{'--grade-color':grade.color}}>
                                <span className="st-grade-letter">{grade.letter}</span>
                                <span className="st-grade-gpa">{grade.gpa}</span>
                              </div>
                            ):<span className="st-nil">—</span>}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ─ Prompt to setup ─ */}
                {!config && !isSetup && (
                  <div className="st-setup-prompt" onClick={()=>openSetup(course.id)}>
                    <Settings2 size={16} style={{opacity:0.5}}/>
                    <span>Click <strong>Setup Marks</strong> above to configure mark distribution</span>
                    <ChevronRight size={14} style={{opacity:0.4}}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* keyboard hint */}
      {labCourses.some(c=>labConfig[c.id]) && (
        <p className="st-keyboard-hint">
          💡 <kbd>Tab</kbd> / <kbd>↑↓</kbd> to navigate cells
        </p>
      )}

    </div>
  );
}
