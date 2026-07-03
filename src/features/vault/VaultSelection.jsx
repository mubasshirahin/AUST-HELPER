import React, { useMemo } from 'react';
import { BookOpen, Building2, GraduationCap, Library, ArrowLeft } from 'lucide-react';
import {
  heatmapDepartments,
  departmentLabels,
  getDepartmentPaperCount,
  getSemesterPaperCount,
  getCourseCategories,
  getYearSemOptions,
} from './vaultUtils';

export default function VaultSelection({
  department,
  yearSem,
  onSelectDepartment,
  onSelectYearSem,
  onSelectCourse,
  onBackToDepartments,
  onBackToSemesters,
}) {
  const yearSemOptions = useMemo(
    () => (department ? getYearSemOptions(department) : []),
    [department],
  );

  const courseCategories = useMemo(() => {
    if (!department || !yearSem) return [];
    return getCourseCategories(department, yearSem);
  }, [department, yearSem]);

  if (!department) {
    return (
      <div className="glass-card-static question-bank-container animate-fadeInUp">
        <div className="qb-dept-picker-header">
          <div className="flex items-center gap-2">
            <div
              className="icon"
              style={{
                backgroundColor: 'var(--accent-purple-glow)',
                color: 'var(--accent-purple)',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>
                Select Department
              </h2>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Start by choosing your department to browse resources
              </p>
            </div>
          </div>
        </div>

        <div className="qb-dept-grid">
          {heatmapDepartments.map((dept) => {
            const paperCount = getDepartmentPaperCount(dept);
            return (
              <button
                key={dept}
                type="button"
                className="qb-dept-card"
                onClick={() => onSelectDepartment(dept)}
              >
                <span className="qb-dept-code">{dept}</span>
                <span className="qb-dept-name">{departmentLabels[dept] || dept}</span>
                <span className="qb-dept-count">
                  {paperCount > 0 ? `${paperCount} papers` : 'Coming soon'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!yearSem) {
    return (
      <div className="glass-card-static question-bank-container animate-fadeInUp">
        <div className="qb-dept-picker-header">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm qb-back-btn"
                onClick={onBackToDepartments}
                title="Back to departments"
              >
                <ArrowLeft size={14} />
              </button>
              <div
                className="icon"
                style={{
                  backgroundColor: 'var(--accent-blue-glow)',
                  color: 'var(--accent-blue)',
                  padding: '6px',
                  borderRadius: '8px',
                }}
              >
                <GraduationCap size={18} />
              </div>
              <div>
                <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>
                  Select Semester
                </h2>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  {department} — {departmentLabels[department]}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Department</span>
              <select
                className="input"
                value={department}
                onChange={(e) => onSelectDepartment(e.target.value)}
                style={{ minWidth: '120px' }}
              >
                {heatmapDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={`qb-sem-grid ${department === 'ARCH' ? 'qb-sem-grid-arch' : ''}`}>
          {yearSemOptions.map((sem) => {
            const paperCount = getSemesterPaperCount(department, sem);
            return (
              <button
                key={sem}
                type="button"
                className="qb-sem-card"
                onClick={() => onSelectYearSem(sem)}
              >
                <span className="qb-sem-label">{sem}</span>
                <span className="qb-sem-count">
                  {paperCount > 0 ? `${paperCount} papers` : 'No papers'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-static question-bank-container animate-fadeInUp">
      <div className="qb-dept-picker-header">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm qb-back-btn"
              onClick={onBackToSemesters}
              title="Back to semesters"
            >
              <ArrowLeft size={14} />
            </button>
            <div
              className="icon"
              style={{
                backgroundColor: 'var(--accent-emerald-glow)',
                color: 'var(--accent-emerald)',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <Library size={18} />
            </div>
            <div>
              <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>
                Select Course
              </h2>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Semester {yearSem} — pick a course to open resources
              </p>
            </div>
          </div>

          <div className="qb-selection-bar">
            <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Department</span>
              <select
                className="input"
                value={department}
                onChange={(e) => onSelectDepartment(e.target.value)}
                style={{ minWidth: '120px' }}
              >
                {heatmapDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Semester</span>
              <select
                className="input"
                value={yearSem}
                onChange={(e) => onSelectYearSem(e.target.value)}
                style={{ minWidth: '80px' }}
              >
                {yearSemOptions.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {courseCategories.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <BookOpen size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            No courses found for {department} — Semester {yearSem}.
          </p>
        </div>
      ) : (
        <div className="qb-course-grid">
          {courseCategories.map((course) => (
            <button
              key={course.course}
              type="button"
              className="qb-course-card"
              onClick={() => onSelectCourse(course.course, course.name)}
            >
              <span className="qb-course-name">{course.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
