import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  heatmapDepartments,
  departmentLabels,
  getCourseCategories,
  getYearSemOptions,
} from './vaultUtils';

export default function VaultContextBar({
  department,
  yearSem,
  course,
  courseName,
  onBackToCourses,
  onDepartmentChange,
  onYearSemChange,
  onCourseChange,
}) {
  const yearSemOptions = useMemo(() => getYearSemOptions(department), [department]);
  const courseOptions = useMemo(
    () => getCourseCategories(department, yearSem),
    [department, yearSem],
  );

  return (
    <div className="vault-context-bar glass-card-static">
      <button
        type="button"
        className="btn btn-ghost btn-sm qb-back-btn"
        onClick={onBackToCourses}
        title="Change course"
      >
        <ArrowLeft size={14} />
      </button>

      <div className="vault-context-info">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>
          {courseName}
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: 0 }}>
          {department} · Semester {yearSem} · {course}
        </p>
      </div>

      <div className="qb-selection-bar vault-context-selects">
        <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Dept</span>
          <select
            className="input"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            style={{ minWidth: '100px' }}
          >
            {heatmapDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Sem</span>
          <select
            className="input"
            value={yearSem}
            onChange={(e) => onYearSemChange(e.target.value)}
            style={{ minWidth: '72px' }}
          >
            {yearSemOptions.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Course</span>
          <select
            className="input"
            value={course}
            onChange={(e) => onCourseChange(e.target.value)}
            style={{ minWidth: '140px' }}
          >
            {courseOptions.map((item) => (
              <option key={item.course} value={item.course}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <span className="badge badge-blue" style={{ fontSize: '10px' }}>
          {departmentLabels[department]}
        </span>
      </div>
    </div>
  );
}
