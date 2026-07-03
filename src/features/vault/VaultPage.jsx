import React, { useState, useMemo, useEffect } from 'react';
import VaultSelection from './VaultSelection';
import VaultContextBar from './VaultContextBar';
import QuestionBank from './QuestionBank';
import TopicHeatmap from './TopicHeatmap';
import MaterialFolders from './MaterialFolders';
import PlaylistPlayer from './PlaylistPlayer';
import SkillRoadmap from './SkillRoadmap';
import Cheatsheets from './Cheatsheets';
import { vaultResourceTabs, getCourseCategories } from './vaultUtils';
import { loadVaultSelection, saveVaultSelection } from './vaultSelectionStorage';
import './VaultPage.css';

export default function VaultPage() {
  const [initialSelection] = useState(loadVaultSelection);
  const [department, setDepartment] = useState(initialSelection.department);
  const [yearSem, setYearSem] = useState(initialSelection.yearSem);
  const [course, setCourse] = useState(initialSelection.course);
  const [courseName, setCourseName] = useState(initialSelection.courseName);
  const [activeTab, setActiveTab] = useState(initialSelection.activeTab);

  const isReady = Boolean(department && yearSem && course);

  const vaultContext = useMemo(
    () => ({ department, yearSem, course, courseName }),
    [department, yearSem, course, courseName],
  );

  useEffect(() => {
    saveVaultSelection({ department, yearSem, course, courseName, activeTab });
  }, [department, yearSem, course, courseName, activeTab]);

  const handleSelectDepartment = (nextDepartment) => {
    setDepartment(nextDepartment);
    setYearSem(null);
    setCourse(null);
    setCourseName('');
  };

  const handleSelectYearSem = (nextYearSem) => {
    setYearSem(nextYearSem);
    setCourse(null);
    setCourseName('');
  };

  const handleSelectCourse = (nextCourse, nextCourseName) => {
    setCourse(nextCourse);
    setCourseName(nextCourseName);
    setActiveTab('qb');
  };

  const handleBackToDepartments = () => {
    setDepartment(null);
    setYearSem(null);
    setCourse(null);
    setCourseName('');
  };

  const handleBackToSemesters = () => {
    setYearSem(null);
    setCourse(null);
    setCourseName('');
  };

  const handleBackToCourses = () => {
    setCourse(null);
    setCourseName('');
  };

  const handleDepartmentChange = (nextDepartment) => {
    handleSelectDepartment(nextDepartment);
  };

  const handleYearSemChange = (nextYearSem) => {
    handleSelectYearSem(nextYearSem);
  };

  const handleCourseChange = (nextCourse) => {
    const match = getCourseCategories(department, yearSem).find((item) => item.course === nextCourse);
    setCourse(nextCourse);
    setCourseName(match?.name || nextCourse);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'qb':
        return <QuestionBank vaultContext={vaultContext} />;
      case 'heatmap':
        return <TopicHeatmap vaultContext={vaultContext} />;
      case 'materials':
        return <MaterialFolders vaultContext={vaultContext} />;
      case 'playlists':
        return <PlaylistPlayer vaultContext={vaultContext} />;
      case 'roadmap':
        return <SkillRoadmap vaultContext={vaultContext} />;
      case 'cheatsheets':
        return <Cheatsheets vaultContext={vaultContext} />;
      default:
        return <QuestionBank vaultContext={vaultContext} />;
    }
  };

  return (
    <div className="vault-page animate-fadeIn">
      <div className="vault-header">
        <h1 className="page-title">Resource Vault</h1>
        <p className="page-description">
          {isReady
            ? `Browse resources for ${courseName} — pick a category below.`
            : 'Select your department, semester, and course to access study resources.'}
        </p>
      </div>

      {!isReady ? (
        <VaultSelection
          department={department}
          yearSem={yearSem}
          onSelectDepartment={handleSelectDepartment}
          onSelectYearSem={handleSelectYearSem}
          onSelectCourse={handleSelectCourse}
          onBackToDepartments={handleBackToDepartments}
          onBackToSemesters={handleBackToSemesters}
        />
      ) : (
        <>
          <VaultContextBar
            department={department}
            yearSem={yearSem}
            course={course}
            courseName={courseName}
            onBackToCourses={handleBackToCourses}
            onDepartmentChange={handleDepartmentChange}
            onYearSemChange={handleYearSemChange}
            onCourseChange={handleCourseChange}
          />

          <div className="tabs vault-tabs vault-resource-tabs">
            {vaultResourceTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="vault-content-area">{renderActiveTab()}</div>
        </>
      )}
    </div>
  );
}
