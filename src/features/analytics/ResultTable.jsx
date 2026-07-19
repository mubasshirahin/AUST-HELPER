import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, FileSpreadsheet, Pencil, Plus, RotateCcw, Trash2, X, Download } from 'lucide-react';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import { formatSemesterLabel } from '../../utils/semester';
import { syncHeatmapFromTracker } from '../../utils/deptHeatmapStorage';
import { semesterResults as mockSemesterResults } from '../../data/mockData';
import { getUserStorageItem, setUserStorageItem, getUserStorageKey, removeUserStorageItem } from '../../utils/authStorage';
import { loadTemplates } from '../../utils/transcriptTemplates';
import { useAuth } from '../../context/AuthContext';

const gradePoints = {
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
  '-': null,
};

const gradeOptions = Object.keys(gradePoints);
const storageKeyType = 'semesterResults';
const maxSemester = 8;

const createBlankCourse = (semNum, index = 0) => ({
  code: '',
  name: '',
  credit: 3,
  grade: '-',
  point: null,
});

const createBlankSemester = (semNum) => ({
  semester: semNum,
  year: '',
  sgpa: null,
  cgpa: null,
  courses: [createBlankCourse(semNum)],
});

const sortCourses = (courses) => [...courses].sort((firstCourse, secondCourse) => {
  const firstCode = firstCourse.code || firstCourse.name || '';
  const secondCode = secondCourse.code || secondCourse.name || '';
  return firstCode.localeCompare(secondCode, undefined, { numeric: true, sensitivity: 'base' });
});

const getCreditValue = (credit) => Number(credit) || 0;

const formatCredit = (credit) => parseFloat(Number(credit).toFixed(2)).toString();

const cloneResults = (results) => results.map((sem) => ({
  ...sem,
  courses: sortCourses(sem.courses.map((course) => ({ ...course }))),
}));

const normalizeResults = (results) => {
  const clonedResults = cloneResults(results);
  const normalizedResults = Array.from({ length: maxSemester }, (_, index) => {
    const semesterNumber = index + 1;
    return clonedResults.find((sem) => sem.semester === semesterNumber) ?? createBlankSemester(semesterNumber);
  });

  return normalizedResults.map((sem) => ({
    ...sem,
    courses: sortCourses(sem.courses.length > 0 ? sem.courses : [createBlankCourse(sem.semester)]),
  }));
};

const getDefaultResults = () => Array.from({ length: maxSemester }, (_, index) => createBlankSemester(index + 1));

const roundTwo = (value) => Number(value.toFixed(2));

const calculateSemesterStats = (results) => {
  let totalCredits = 0;
  let totalWeightedPoints = 0;

  return results.map((sem) => {
    const gradedCourses = sem.courses.filter((course) => course.point !== null);
    const semCredits = gradedCourses.reduce((sum, course) => sum + getCreditValue(course.credit), 0);
    const semWeightedPoints = gradedCourses.reduce((sum, course) => sum + (getCreditValue(course.credit) * course.point), 0);

    totalCredits += semCredits;
    totalWeightedPoints += semWeightedPoints;

    return {
      ...sem,
      courses: sortCourses(sem.courses.map((course) => ({
        ...course,
        credit: getCreditValue(course.credit),
      }))),
      sgpa: semCredits > 0 ? roundTwo(semWeightedPoints / semCredits) : null,
      cgpa: totalCredits > 0 ? roundTwo(totalWeightedPoints / totalCredits) : null,
    };
  });
};

const loadStoredResults = () => {
  try {
    const storedResults = getUserStorageItem(storageKeyType);
    if (storedResults) {
      return calculateSemesterStats(normalizeResults(storedResults));
    }
    if (mockSemesterResults && mockSemesterResults.length > 0) {
      return calculateSemesterStats(normalizeResults(mockSemesterResults));
    }
    return calculateSemesterStats(getDefaultResults());
  } catch {
    return calculateSemesterStats(getDefaultResults());
  }
};

const hasStoredResults = () => {
  try {
    const key = getUserStorageKey(storageKeyType);
    return Boolean(key && localStorage.getItem(key));
  } catch {
    return false;
  }
};

export default function ResultTable({ onResultsChange }) {
  const { user } = useAuth();
  const getInitialSem = () => {
    const ysMatch = (user?.yearSemester || '').match(/Year (\d+) - Semester (\d+)/);
    if (ysMatch) { const y = parseInt(ysMatch[1]), s = parseInt(ysMatch[2]); if (y >= 1 && y <= 4 && s >= 1 && s <= 2) return (y - 1) * 2 + s; }
    if (user?.semester && user.semester >= 1 && user.semester <= 8) return user.semester;
    return 1;
  };
  const [expandedSemester, setExpandedSemester] = useState(getInitialSem);
  const [results, setResults] = useState(loadStoredResults);
  const [draftResults, setDraftResults] = useState(() => cloneResults(results));
  const [editingSemester, setEditingSemester] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [showTemplateSelectionModal, setShowTemplateSelectionModal] = useState(false);
  const [selectedSemesterForTemplate, setSelectedSemesterForTemplate] = useState(null);
  const [templatesForSelection, setTemplatesForSelection] = useState([]);
  const hasCustomResults = hasStoredResults();
  const inputRefs = useRef({});

  const handleKeyDown = (e, semNum, rowIdx, fieldIdx) => {
    const fieldsPerRow = 3; // name, credit, grade (skip course code)
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (fieldIdx + 1 < fieldsPerRow) {
        inputRefs.current[`r_${semNum}_${rowIdx}_${fieldIdx + 1}`]?.focus();
      } else if (rowIdx + 1 < (draftResults.find(s => s.semester === semNum)?.courses.length || 0)) {
        inputRefs.current[`r_${semNum}_${rowIdx + 1}_0`]?.focus();
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (fieldIdx - 1 >= 0) {
        inputRefs.current[`r_${semNum}_${rowIdx}_${fieldIdx - 1}`]?.focus();
      } else if (rowIdx - 1 >= 0) {
        inputRefs.current[`r_${semNum}_${rowIdx - 1}_2`]?.focus();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const courses = draftResults.find(s => s.semester === semNum)?.courses || [];
      if (rowIdx + 1 < courses.length) {
        inputRefs.current[`r_${semNum}_${rowIdx + 1}_${fieldIdx}`]?.focus();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIdx - 1 >= 0) {
        inputRefs.current[`r_${semNum}_${rowIdx - 1}_${fieldIdx}`]?.focus();
      }
    }
  };

  useEffect(() => {
    // Load available templates
    const templates = loadTemplates();
    setAvailableTemplates(templates);
  }, []);

  const toggleSemester = (semNum) => {
    setExpandedSemester(expandedSemester === semNum ? null : semNum);
  };

  const startEditing = (semNum) => {
    setDraftResults(cloneResults(results));
    setEditingSemester(semNum);
    setExpandedSemester(semNum);
  };

  const cancelEditing = () => {
    setDraftResults(cloneResults(results));
    setEditingSemester(null);
  };

  const saveEditing = () => {
    const updatedResults = calculateSemesterStats(draftResults);
    setResults(updatedResults);
    setDraftResults(cloneResults(updatedResults));
    setUserStorageItem(storageKeyType, updatedResults);
    setEditingSemester(null);
    syncHeatmapFromTracker();
    onResultsChange?.(updatedResults);
  };

  const resetResults = () => {
    const defaultResults = calculateSemesterStats(getDefaultResults());
    setResults(defaultResults);
    setDraftResults(cloneResults(defaultResults));
    removeUserStorageItem(storageKeyType);
    setEditingSemester(null);
    syncHeatmapFromTracker();
    onResultsChange?.(defaultResults);
  };

  const handleLoadTemplate = (template) => {
    // Find which semester this template is for
    const semesterMap = {
      '1-1': 1, '1-2': 2, '2-1': 3, '2-2': 4,
      '3-1': 5, '3-2': 6, '4-1': 7, '4-2': 8
    };
    const semNum = semesterMap[template.semester] || 1;

    // Convert template courses to result format
    const templateCourses = template.courses.map(course => ({
      code: course.code,
      name: course.name,
      credit: getCreditValue(course.credit),
      grade: course.grade || '-',
      point: course.point !== null ? course.point : gradePoints[course.grade || '-'],
    }));

    // Update the results with template data for the specific semester
    const updatedResults = results.map(sem => {
      if (sem.semester === semNum) {
        return {
          ...sem,
          courses: sortCourses(templateCourses),
          year: template.year || sem.year,
        };
      }
      return sem;
    });

    const calculatedResults = calculateSemesterStats(updatedResults);
    setResults(calculatedResults);
    setDraftResults(cloneResults(calculatedResults));
    setUserStorageItem(storageKeyType, calculatedResults);
    setEditingSemester(null);
    syncHeatmapFromTracker();
    onResultsChange?.(calculatedResults);
    setShowLoadModal(false);
  };

  const updateCourseField = (semNum, courseIndex, field, value) => {
    setDraftResults((currentDraft) => currentDraft.map((sem) => {
      if (sem.semester !== semNum) return sem;

      return {
        ...sem,
        courses: sem.courses.map((course, index) => {
          if (index !== courseIndex) return course;

          const updatedCourse = { ...course, [field]: value };

          if (field === 'grade') {
            updatedCourse.point = gradePoints[value];
          }

          return updatedCourse;
        }),
      };
    }));
  };

  const addCourse = (semNum) => {
    setDraftResults((currentDraft) => currentDraft.map((sem) => {
      if (sem.semester !== semNum) return sem;

      return {
        ...sem,
        courses: [...sem.courses, createBlankCourse(semNum, sem.courses.length)],
      };
    }));
  };

  const removeCourse = (semNum, courseIndex) => {
    setDraftResults((currentDraft) => currentDraft.map((sem) => {
      if (sem.semester !== semNum || sem.courses.length === 1) return sem;

      return {
        ...sem,
        courses: sem.courses.filter((_, index) => index !== courseIndex),
      };
    }));
  };

  const exportTranscript = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 190;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Academic Transcript', pageW / 2, y, { align: 'center' });
    y += 10;

    results.forEach((sem) => {
      const hasCourses = sem.courses.some(c => c.code && c.code.trim() !== '');
      if (!hasCourses) return;

      const boxH = 12 + sem.courses.length * 7 + 12;
      if (y + boxH > 280) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(200);
      doc.setFillColor(248, 248, 252);
      doc.roundedRect(10, y, pageW, boxH, 3, 3, 'FD');

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${formatSemesterLabel(sem.semester)}${sem.year ? ` (${sem.year})` : ''}`, 16, y + 8);

      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('Code', 16, y + 16);
      doc.text('Course', 42, y + 16);
      doc.text('Cr', 120, y + 16, { align: 'center' });
      doc.text('Grade', 138, y + 16, { align: 'center' });
      doc.text('GPA', 156, y + 16, { align: 'center' });

      let rowY = y + 16;
      sem.courses.forEach((course) => {
        if (!course.code && !course.name) return;
        rowY += 7;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(course.code || '-', 16, rowY);
        doc.text(course.name || '-', 42, rowY);
        doc.text(formatCredit(course.credit), 120, rowY, { align: 'center' });
        doc.text(course.grade || '-', 138, rowY, { align: 'center' });
        doc.text(course.point !== null ? course.point.toFixed(2) : '-', 156, rowY, { align: 'center' });
      });

      const sumY = y + boxH - 5;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text(`SGPA: ${sem.sgpa ?? '—'}    CGPA: ${sem.cgpa ?? '—'}`, pageW - 10, sumY, { align: 'right' });

      y += boxH + 6;
    });

    doc.save('aust-transcript.pdf');
  };

  const getCurrentSemester = () => {
    const ysMatch = (user?.yearSemester || '').match(/Year (\d+) - Semester (\d+)/);
    if (ysMatch) {
      const y = parseInt(ysMatch[1]), s = parseInt(ysMatch[2]);
      if (y >= 1 && y <= 4 && s >= 1 && s <= 2) return (y - 1) * 2 + s;
    }
    if (user?.semester && user.semester >= 1 && user.semester <= 8) return user.semester;
    for (let i = results.length - 1; i >= 0; i--) {
      const sem = results[i];
      const hasRealCourses = sem.courses.some(c => c.code && c.code.trim() !== '');
      const hasPendingGrade = sem.courses.some(c => c.grade === '-' || c.point === null);
      if (hasRealCourses && hasPendingGrade) return sem.semester;
    }
    return null;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'badge-emerald';
      case 'A': return 'badge-blue';
      case 'A-': return 'badge-cyan';
      case 'B+': return 'badge-amber';
      case 'B': return 'badge-orange';
      case 'B-': return 'badge-purple';
      case '-': return 'badge-blue'; // In Progress
      default: return 'badge-rose';
    }
  };

  return (
    <div className="result-table-container animate-fadeInUp" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--sp-5)',
      boxShadow: '0 4px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Academic Transcript Breakdown</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Detailed semester-wise grade sheet breakdown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportTranscript}>
            <FileSpreadsheet size={14} /> Export Transcript
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)', marginRight: '4px' }}>View:</span>
        {results.map((sem) => {
          const hasReal = sem.courses.some(c => c.code && c.code.trim() !== '');
          return (
            <button key={sem.semester} onClick={() => setExpandedSemester(expandedSemester === sem.semester ? null : sem.semester)}
              style={{
                border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '4px 12px',
                fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap',
                background: expandedSemester === sem.semester ? 'var(--accent-amber)' : 'rgba(255,255,255,0.04)',
                color: expandedSemester === sem.semester ? '#0d0d0d' : hasReal ? 'var(--text-primary)' : 'var(--text-tertiary)',
                opacity: hasReal ? 1 : 0.45,
                transition: 'all 0.15s'
              }}>
              {formatSemesterLabel(sem.semester)}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {results.map((sem) => {
          const displaySemester = editingSemester === sem.semester
            ? draftResults.find((draftSem) => draftSem.semester === sem.semester) ?? sem
            : sem;
          const isExpanded = expandedSemester === sem.semester;
          const isCurrentSemester = displaySemester.semester === getCurrentSemester();
          const isEditing = editingSemester === sem.semester;

          return (
            <div 
              key={sem.semester}
              style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all var(--transition-base)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            >
              {/* Semester row header */}
              <div 
                onClick={() => toggleSemester(sem.semester)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)' }}>
                      {formatSemesterLabel(displaySemester.semester)}
                    </h3>
                    {displaySemester.year && (
                      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        Batch {displaySemester.year}
                      </span>
                    )}
                    {isCurrentSemester && (
                      <span className="badge badge-purple" style={{ fontSize: '8px', padding: '1px 5px' }}>CURRENT SEMESTER</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6" style={{ marginRight: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', textAlign: 'right' }}>SGPA</span>
                    <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: 'var(--accent-cyan)' }}>{displaySemester.sgpa ?? '—'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', textAlign: 'right' }}>CGPA</span>
                    <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: 'var(--accent-amber)' }}>{displaySemester.cgpa ?? '—'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ marginRight: '12px' }} onClick={(event) => event.stopPropagation()}>
                  {/* Load Template button for this semester */}
                  {!isEditing && (() => {
                    const year = Math.ceil(sem.semester / 2);
                    const half = sem.semester % 2 === 1 ? '1' : '2';
                    const semCode = `${year}-${half}`;
                    const matchingTemplates = availableTemplates.filter(t => t.semester === semCode);
                    return (
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchingTemplates.length > 0) {
                            // Show modal to choose template
                            setSelectedSemesterForTemplate(sem.semester);
                            setTemplatesForSelection(matchingTemplates);
                            setShowTemplateSelectionModal(true);
                          } else {
                            alert(`No template available for ${formatSemesterLabel(sem.semester)}. Admin needs to create one.`);
                          }
                        }}
                        title={`Load template for ${formatSemesterLabel(sem.semester)}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        disabled={matchingTemplates.length === 0}
                      >
                        <Download size={12} /> Load Template
                      </button>
                    );
                  })()}
                  {/* Reset button for this semester */}
                  {!isEditing && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Reset this semester to blank state directly without confirmation popup
                        const updatedResults = results.map(s => {
                          if (s.semester === sem.semester) {
                            return {
                              ...s,
                              courses: [{ code: '', name: '', credit: 3, grade: '-', point: null }],
                              year: ''
                            };
                          }
                          return s;
                        });
                        const calculatedResults = calculateSemesterStats(updatedResults);
                        setResults(calculatedResults);
                        setDraftResults(cloneResults(calculatedResults));
                        setUserStorageItem(storageKeyType, calculatedResults);
                        syncHeatmapFromTracker();
                        onResultsChange?.(calculatedResults);
                      }}
                      title={`Reset ${formatSemesterLabel(sem.semester)}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  )}
                  {isEditing ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={saveEditing}>
                        <Check size={14} /> Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEditing}>
                        <X size={14} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => startEditing(sem.semester)}>
                      <Pencil size={14} /> Edit
                    </button>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Collapsed table details */}
              {isExpanded && (
                <div className="animate-fadeIn" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px', background: 'rgba(255,255,255,0.015)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
                        <th style={{ padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)' }}>Course Code</th>
                        <th style={{ padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)' }}>Course Title</th>
                        <th style={{ padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)', textAlign: 'center' }}>Credits</th>
                        <th style={{ padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)', textAlign: 'center' }}>Grade</th>
                        <th style={{ padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)', textAlign: 'center' }}>GPA</th>
                        {isEditing && (
                          <th style={{ width: '52px', padding: '8px', color: 'var(--text-tertiary)', fontWeight: 'var(--fw-semibold)', textAlign: 'center' }}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {displaySemester.courses.map((course, courseIndex) => (
                        <tr key={`${displaySemester.semester}-${courseIndex}`} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 'var(--fw-semibold)', position: 'relative', overflow: 'visible', zIndex: 1000 }}>
                            {isEditing ? (
                              <div style={{ position: 'relative', zIndex: 10001 }}>
                                <CourseAutocomplete
                                  value={course.code}
                                  department={user?.department}
                                  onCourseSelect={(selectedCourse) => {
                                    updateCourseField(displaySemester.semester, courseIndex, 'code', selectedCourse.code);
                                    updateCourseField(displaySemester.semester, courseIndex, 'name', selectedCourse.name);
                                    // Auto-fill credit based on last digit of course code
                                    // Odd digit (1,3,5,7,9) = 3 credits, Even digit (0,2,4,6,8) = 1.5 credits
                                    const lastDigit = parseInt(selectedCourse.code.slice(-1));
                                    if (!isNaN(lastDigit)) {
                                      const autoCredit = lastDigit % 2 === 1 ? 3 : 1.5;
                                      updateCourseField(displaySemester.semester, courseIndex, 'credit', autoCredit.toString());
                                    }
                                  }}
                                  placeholder="CSE 4201"
                                  type="code"
                                />
                              </div>
                            ) : (
                              course.code || '-'
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                            {isEditing ? (
                              <input
                                ref={el => inputRefs.current[`r_${displaySemester.semester}_${courseIndex}_0`] = el}
                                className="input"
                                value={course.name}
                                onChange={(event) => updateCourseField(displaySemester.semester, courseIndex, 'name', event.target.value)}
                                placeholder="Course title"
                                style={{ minWidth: '220px' }}
                                onKeyDown={e => handleKeyDown(e, displaySemester.semester, courseIndex, 0)}
                              />
                            ) : (
                              course.name
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {isEditing ? (
                              <input
                                ref={el => inputRefs.current[`r_${displaySemester.semester}_${courseIndex}_1`] = el}
                                className="input"
                                type="number"
                                min="0"
                                step="0.5"
                                value={course.credit}
                                onChange={(event) => updateCourseField(displaySemester.semester, courseIndex, 'credit', event.target.value)}
                                style={{ width: '82px', margin: '0 auto', textAlign: 'center' }}
                                onKeyDown={e => handleKeyDown(e, displaySemester.semester, courseIndex, 1)}
                              />
                            ) : (
                              formatCredit(course.credit)
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {isEditing ? (
                              <select
                                ref={el => inputRefs.current[`r_${displaySemester.semester}_${courseIndex}_2`] = el}
                                className="input"
                                value={course.grade}
                                onChange={(event) => updateCourseField(displaySemester.semester, courseIndex, 'grade', event.target.value)}
                                style={{ width: '76px', padding: '5px 8px', textAlign: 'center', margin: '0 auto' }}
                                onKeyDown={e => handleKeyDown(e, displaySemester.semester, courseIndex, 2)}
                              >
                                {gradeOptions.map((grade) => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`badge ${getGradeColor(course.grade)}`} style={{ padding: '3px 10px', minWidth: '40px', textAlign: 'center', justifyContent: 'center', fontWeight: '700', letterSpacing: '0.03em' }}>
                                {course.grade}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'var(--fw-semibold)' }}>
                            {course.point !== null ? course.point.toFixed(2) : '-'}
                          </td>
                          {isEditing && (
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <button
                                className="btn btn-secondary btn-icon"
                                onClick={() => removeCourse(displaySemester.semester, courseIndex)}
                                disabled={displaySemester.courses.length === 1}
                                title="Remove course"
                                style={{ width: '30px', height: '30px', opacity: displaySemester.courses.length === 1 ? 0.45 : 1 }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 'var(--fw-semibold)' }}>SGPA</span>
                      <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: 'var(--accent-cyan)' }}>{displaySemester.sgpa ?? '—'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 'var(--fw-semibold)' }}>CGPA</span>
                      <span style={{ fontWeight: 'var(--fw-bold)', fontSize: 'var(--fs-sm)', color: 'var(--accent-amber)' }}>{displaySemester.cgpa ?? '—'}</span>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-between items-center" style={{ marginTop: '12px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => addCourse(displaySemester.semester)}>
                        <Plus size={14} /> Add Course
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Template Selection Modal */}
      {showTemplateSelectionModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateSelectionModal(false)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: '0 0 16px' }}>
              Select Template for {formatSemesterLabel(selectedSemesterForTemplate)}
            </h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Choose a template to load courses for this semester.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templatesForSelection.map(template => (
                <div 
                  key={template.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    handleLoadTemplate(template);
                    setShowTemplateSelectionModal(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-amber) 8%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: 0 }}>{template.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-blue" style={{ fontSize: '8px', padding: '1px 4px' }}>{template.department}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{template.year}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{template.courses.length} courses</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--accent-amber)' }}>
                      Click to load
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplateSelectionModal(false)} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Template Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal glass-card-static" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: '0 0 16px' }}>Load Transcript Template</h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select a template to quickly populate your transcript with standard courses for a semester.
            </p>
            
            {availableTemplates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                No templates available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableTemplates.map(template => (
                  <div 
                    key={template.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => handleLoadTemplate(template)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-amber)';
                      e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-amber) 8%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: 0 }}>{template.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-blue" style={{ fontSize: '8px', padding: '1px 4px' }}>{template.department}</span>
                          <span className="badge badge-purple" style={{ fontSize: '8px', padding: '1px 4px' }}>Sem {template.semester}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{template.year}</span>
                        </div>
                      </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                            {template.courses.length} courses
                          </span>
                          <div style={{ fontSize: '9px', color: 'var(--accent-amber)', marginTop: '2px' }}>
                            Click to load
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-secondary)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowLoadModal(false)} style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
