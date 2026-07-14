import React, { useState, useMemo, useEffect } from 'react';
import { Archive, ArrowLeft, Users, StickyNote, BookOpen } from 'lucide-react';
import VaultSelection from './VaultSelection';
import VaultStepProgress from './VaultStepProgress';
import VaultBatchSelector from './VaultBatchSelector';
import MaterialFolders from './MaterialFolders';
import Notebook from './Notebook';
import { loadVaultSelection, saveVaultSelection } from './vaultSelectionStorage';
import './VaultPage.css';
import './VaultBatchSelector.css';
import './Notebook.css';

function getSelectionStep(department, yearSem, batch) {
  if (!department) return 'dept';
  if (!yearSem) return 'sem';
  if (!batch) return 'batch';
  return 'ready';
}

export default function VaultPage() {
  const [initialSelection] = useState(loadVaultSelection);
  const [department, setDepartment] = useState(initialSelection.department);
  const [yearSem, setYearSem] = useState(initialSelection.yearSem);
  const [batch, setBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  const isReady = Boolean(department && yearSem && batch);
  const selectionStep = getSelectionStep(department, yearSem, batch);

  const vaultContext = useMemo(
    () => ({ department, yearSem, batch, course: null, courseName: yearSem || '', courseType: 'Theory' }),
    [department, yearSem, batch],
  );

  useEffect(() => {
    saveVaultSelection({ department, yearSem, activeTab });
  }, [department, yearSem, activeTab]);

  const handleSelectDepartment = (nextDepartment) => {
    setDepartment(nextDepartment);
    setYearSem(null);
    setBatch(null);
  };

  const handleSelectYearSem = (nextYearSem) => {
    setYearSem(nextYearSem);
    setBatch(null);
    setActiveTab('materials');
  };

  const handleSelectBatch = (nextBatch) => {
    setBatch(nextBatch);
    setActiveTab('materials');
  };

  const handleBackToDepartments = () => {
    setDepartment(null);
    setYearSem(null);
    setBatch(null);
  };

  const handleBackToSemesters = () => {
    setYearSem(null);
    setBatch(null);
  };

  const handleBackToBatches = () => {
    setBatch(null);
  };

  const tabs = [
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'notebook', label: 'Notebook', icon: StickyNote },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'notebook':
        return <Notebook vaultContext={vaultContext} batch={batch} />;
      default:
        return <MaterialFolders vaultContext={vaultContext} />;
    }
  };

  return (
    <div className="vault-page animate-fadeIn">
      <header className="vault-hero">
        <div className="vault-hero-bg" aria-hidden="true">
          <div className="vault-hero-grid" />
        </div>

        <div className="vault-hero-content">
          <div className="vault-hero-title-row">
            <div className="vault-hero-icon">
              <Archive size={26} />
            </div>
            <div>
              <h1 className="vault-hero-title">Resource Vault</h1>
              <p className="vault-hero-subtitle">
                {isReady
                  ? `${department} — Semester ${yearSem} · ${batch.batchName}`
                  : 'Pick your semester. Unlock lecture notes, papers & more.'}
              </p>
            </div>
          </div>

          {!isReady && (
            <VaultStepProgress currentStep={selectionStep} />
          )}
        </div>
      </header>

      {!isReady ? (
        selectionStep === 'batch' ? (
          <VaultBatchSelector
            department={department}
            yearSem={yearSem}
            onSelectBatch={handleSelectBatch}
          />
        ) : (
          <VaultSelection
            department={department}
            yearSem={yearSem}
            onSelectDepartment={handleSelectDepartment}
            onSelectYearSem={handleSelectYearSem}
            onBackToDepartments={handleBackToDepartments}
            onBackToSemesters={handleBackToSemesters}
          />
        )
      ) : (
        <div className="vault-workspace vault-workspace-enter">
          <div className="vault-sem-context-bar">
            <button
              type="button"
              className="vault-back-btn"
              onClick={handleBackToBatches}
              title="Change batch"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="vault-sem-context-info">
              <h2 className="vault-sem-context-title">{department} — Semester {yearSem}</h2>
              <p className="vault-sem-context-sub">
                <Users size={12} /> {batch.batchName} · Lecture notes & study materials
              </p>
            </div>
            <button
              type="button"
              className="vault-change-sem-btn"
              onClick={handleBackToBatches}
            >
              Change Batch
            </button>
          </div>

          <div className="vault-content-area">
            <div className="vault-inner-tabs">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`vault-inner-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {renderActiveTab()}
          </div>
        </div>
      )}
    </div>
  );
}
