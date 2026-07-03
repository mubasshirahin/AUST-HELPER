import React, { useState, useMemo, useEffect } from 'react';
import { Archive, Sparkles, Layers, BookMarked } from 'lucide-react';
import VaultSelection from './VaultSelection';
import VaultContextBar from './VaultContextBar';
import VaultResourceTabs from './VaultResourceTabs';
import VaultStepProgress from './VaultStepProgress';
import QuestionBank from './QuestionBank';
import TopicHeatmap from './TopicHeatmap';
import MaterialFolders from './MaterialFolders';
import PlaylistPlayer from './PlaylistPlayer';
import { vaultResourceTabs, getCourseCategories } from './vaultUtils';
import { getAllQuestionBankItems } from '../../utils/questionBankStorage';
import { loadVaultSelection, saveVaultSelection } from './vaultSelectionStorage';
import './VaultPage.css';

function getSelectionStep(department, yearSem) {
  if (!department) return 'dept';
  if (!yearSem) return 'sem';
  return 'course';
}

export default function VaultPage() {
  const [initialSelection] = useState(loadVaultSelection);
  const [department, setDepartment] = useState(initialSelection.department);
  const [yearSem, setYearSem] = useState(initialSelection.yearSem);
  const [course, setCourse] = useState(initialSelection.course);
  const [courseName, setCourseName] = useState(initialSelection.courseName);
  const [courseType, setCourseType] = useState(initialSelection.courseType || 'Theory');
  const [activeTab, setActiveTab] = useState(initialSelection.activeTab);

  const isReady = Boolean(department && yearSem && course);
  const selectionStep = getSelectionStep(department, yearSem);

  const vaultContext = useMemo(
    () => ({ department, yearSem, course, courseName, courseType }),
    [department, yearSem, course, courseName, courseType],
  );

  const vaultStats = useMemo(() => {
    const items = getAllQuestionBankItems();
    const scoped = items.filter(
      (item) =>
        item.department === department &&
        item.yearSem === yearSem &&
        item.course === course,
    );
    return {
      papers: scoped.length,
      resources: vaultResourceTabs.length,
    };
  }, [department, yearSem, course]);

  useEffect(() => {
    saveVaultSelection({ department, yearSem, course, courseName, courseType, activeTab });
  }, [department, yearSem, course, courseName, courseType, activeTab]);

  const handleSelectDepartment = (nextDepartment) => {
    setDepartment(nextDepartment);
    setYearSem(null);
    setCourse(null);
    setCourseName('');
    setCourseType('Theory');
  };

  const handleSelectYearSem = (nextYearSem) => {
    setYearSem(nextYearSem);
    setCourse(null);
    setCourseName('');
    setCourseType('Theory');
  };

  const handleSelectCourse = (nextCourse, nextCourseName, nextCourseType = 'Theory') => {
    setCourse(nextCourse);
    setCourseName(nextCourseName);
    setCourseType(nextCourseType);
    setActiveTab('qb');
  };

  const handleBackToDepartments = () => {
    setDepartment(null);
    setYearSem(null);
    setCourse(null);
    setCourseName('');
    setCourseType('Theory');
  };

  const handleBackToSemesters = () => {
    setYearSem(null);
    setCourse(null);
    setCourseName('');
    setCourseType('Theory');
  };

  const handleBackToCourses = () => {
    setCourse(null);
    setCourseName('');
    setCourseType('Theory');
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
    setCourseType(match?.courseType || 'Theory');
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
      default:
        return <QuestionBank vaultContext={vaultContext} />;
    }
  };

  return (
    <div className="vault-page animate-fadeIn">
      <header className="vault-hero">
        <div className="vault-hero-bg" aria-hidden="true">
          <div className="vault-hero-orb vault-hero-orb-1" />
          <div className="vault-hero-orb vault-hero-orb-2" />
          <div className="vault-hero-grid" />
        </div>

        <div className="vault-hero-content">
          <div className="vault-hero-badge">
            <Sparkles size={12} />
            <span>AUST Study Hub</span>
          </div>

          <div className="vault-hero-title-row">
            <div className="vault-hero-icon">
              <Archive size={26} />
            </div>
            <div>
              <h1 className="vault-hero-title">Resource Vault</h1>
              <p className="vault-hero-subtitle">
                {isReady
                  ? `Everything for ${courseName} — one place, zero clutter.`
                  : 'Pick your path. Unlock papers, notes, playlists & more.'}
              </p>
            </div>
          </div>

          {isReady ? (
            <div className="vault-hero-stats">
              <div className="vault-stat-pill">
                <BookMarked size={14} />
                <span><strong>{vaultStats.papers}</strong> papers</span>
              </div>
              <div className="vault-stat-pill">
                <Layers size={14} />
                <span><strong>{vaultStats.resources}</strong> resource types</span>
              </div>
            </div>
          ) : (
            <VaultStepProgress currentStep={selectionStep} />
          )}
        </div>
      </header>

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
        <div className="vault-workspace vault-workspace-enter">
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

          <VaultResourceTabs
            tabs={vaultResourceTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="vault-content-area" key={activeTab}>
            {renderActiveTab()}
          </div>
        </div>
      )}
    </div>
  );
}
