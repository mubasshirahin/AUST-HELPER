import React, { useState } from 'react';
import QuestionBank from './QuestionBank';
import TopicHeatmap from './TopicHeatmap';
import MaterialFolders from './MaterialFolders';
import PlaylistPlayer from './PlaylistPlayer';
import SkillRoadmap from './SkillRoadmap';
import Cheatsheets from './Cheatsheets';
import './VaultPage.css';

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState('qb');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'qb': return <QuestionBank />;
      case 'heatmap': return <TopicHeatmap />;
      case 'materials': return <MaterialFolders />;
      case 'playlists': return <PlaylistPlayer />;
      case 'roadmap': return <SkillRoadmap />;
      case 'cheatsheets': return <Cheatsheets />;
      default: return <QuestionBank />;
    }
  };

  return (
    <div className="vault-page animate-fadeIn">
      <div className="vault-header">
        <h1 className="page-title">Resource Vault</h1>
        <p className="page-description">Search question banks, view topic analyses, browse study folders, and check roadmap skills.</p>
      </div>

      <div className="tabs vault-tabs">
        <button className={`tab ${activeTab === 'qb' ? 'active' : ''}`} onClick={() => setActiveTab('qb')}>Question Bank</button>
        <button className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>Topic Analysis</button>
        <button className={`tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Lecture Notes</button>
        <button className={`tab ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => setActiveTab('playlists')}>YouTube Playlists</button>
        <button className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>Career Roadmaps</button>
        <button className={`tab ${activeTab === 'cheatsheets' ? 'active' : ''}`} onClick={() => setActiveTab('cheatsheets')}>Cheatsheets</button>
      </div>

      <div className="vault-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
