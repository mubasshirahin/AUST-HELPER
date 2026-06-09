import React, { useState, useMemo } from 'react';
import { Sliders, Calculator, Award, RotateCcw, Target } from 'lucide-react';
import { semesterResults, currentUser } from '../../data/mockData';

const GRADE_POINTS = {
  'A+': 4.00,
  'A': 3.75,
  'A-': 3.50,
  'B+': 3.25,
  'B': 3.00,
  'B-': 2.75,
  'C+': 2.50,
  'C': 2.25,
  'D': 2.00,
  'F': 0.00,
};

export default function TargetCalculator() {
  const currentSemester = useMemo(() => {
    return semesterResults.find(r => r.semester === currentUser.semester) || semesterResults[semesterResults.length - 1];
  }, []);

  // Initialize course grades mapping
  const [grades, setGrades] = useState(() => {
    const initial = {};
    currentSemester.courses.forEach(c => {
      initial[c.code] = 'A'; // Default selection is A (3.75) for simulations
    });
    return initial;
  });
  const [targetCgpa, setTargetCgpa] = useState(currentUser.cgpa.toFixed(2));

  const handleGradeChange = (code, val) => {
    setGrades(prev => ({
      ...prev,
      [code]: val
    }));
  };

  const simulationResults = useMemo(() => {
    let totalCurrentCredits = 0;
    let currentGradeSum = 0;

    // Previous completed semesters
    semesterResults.forEach(sem => {
      if (sem.sgpa !== null && sem.semester !== currentUser.semester) {
        sem.courses.forEach(c => {
          totalCurrentCredits += c.credit;
          currentGradeSum += (c.point || 0) * c.credit;
        });
      }
    });

    // Simulating current semester
    let simSemesterCredits = 0;
    let simSemesterSum = 0;

    currentSemester.courses.forEach(c => {
      const selectedGrade = grades[c.code];
      const pt = GRADE_POINTS[selectedGrade];
      simSemesterCredits += c.credit;
      simSemesterSum += pt * c.credit;
    });

    const projectedSGPA = simSemesterSum / simSemesterCredits;
    const projectedCGPA = (currentGradeSum + simSemesterSum) / (totalCurrentCredits + simSemesterCredits);

    const totalCreditsAfterCurrent = totalCurrentCredits + simSemesterCredits;
    const target = Number(targetCgpa);
    const requiredSemesterSum = target * totalCreditsAfterCurrent - currentGradeSum;
    const requiredSGPA = requiredSemesterSum / simSemesterCredits;

    return {
      sgpa: parseFloat(projectedSGPA.toFixed(2)),
      cgpa: parseFloat(projectedCGPA.toFixed(2)),
      diff: parseFloat((projectedCGPA - currentUser.cgpa).toFixed(2)),
      requiredSGPA: Number.isFinite(requiredSGPA) ? parseFloat(requiredSGPA.toFixed(2)) : null,
      targetReachable: requiredSGPA >= 0 && requiredSGPA <= 4,
    };
  }, [grades, currentSemester, targetCgpa]);

  const resetSimulation = () => {
    const reset = {};
    currentSemester.courses.forEach(c => {
      reset[c.code] = 'A';
    });
    setGrades(reset);
    setTargetCgpa(currentUser.cgpa.toFixed(2));
  };

  return (
    <div className="target-calculator-container grid-2 animate-fadeInUp">
      
      {/* Left panel: Course Sliders / Selectors */}
      <div className="glass-card-static">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Simulation Board</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Set target grades for active courses</p>
          </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={resetSimulation}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {currentSemester.courses.map((course) => (
            <div 
              key={course.code} 
              className="flex justify-between items-center p-3"
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>{course.code}</span>
                <h4 style={{ fontSize: '13px', fontWeight: 'var(--fw-medium)' }}>{course.name}</h4>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{course.credit} credits</span>
              </div>

              <div>
                <select 
                  value={grades[course.code]}
                  onChange={(e) => handleGradeChange(course.code, e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: 'var(--fs-sm)',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {Object.keys(GRADE_POINTS).map(g => (
                    <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(2)})</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Visual Outcomes */}
      <div className="glass-card-static flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Simulated GPA Outcomes</h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Real-time predictive results</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--fw-semibold)' }}>
                <span className="flex items-center gap-2"><Target size={14} /> Target CGPA</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  style={{ width: '110px' }}
                />
              </label>
              <p style={{ fontSize: '11px', color: simulationResults.targetReachable ? 'var(--text-secondary)' : 'var(--accent-rose)', marginTop: '8px' }}>
                Required current SGPA: {simulationResults.requiredSGPA?.toFixed(2) ?? '-'}
                {!simulationResults.targetReachable && ' (not reachable in this semester)'}
              </p>
            </div>

            {/* SGPA result card */}
            <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Projected SGPA</span>
              <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--accent-purple)', lineHeight: '1.2', margin: '4px 0' }}>
                {simulationResults.sgpa.toFixed(2)}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Based on current mock selections</p>
            </div>

            {/* CGPA Projection */}
            <div className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Estimated CGPA</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-bold)', color: 'var(--accent-blue)' }}>{simulationResults.cgpa.toFixed(2)}</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>from {currentUser.cgpa}</span>
                </div>
              </div>
              <div>
                {simulationResults.diff >= 0 ? (
                  <span className="badge badge-emerald" style={{ padding: '4px 8px', fontSize: '10px' }}>+{simulationResults.diff.toFixed(2)} Increase</span>
                ) : (
                  <span className="badge badge-rose" style={{ padding: '4px 8px', fontSize: '10px' }}>{simulationResults.diff.toFixed(2)} Decrease</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 mt-6" style={{ background: 'var(--accent-blue-glow)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-focus)' }}>
          <div className="flex gap-2 items-start" style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <Award size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Simulator Info:</span> Changing grades will simulate cumulative grade outcomes. Best for planning studies prior to semester exams.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
