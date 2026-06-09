import React, { useState } from 'react';
import StoryFeed from './StoryFeed';
import SeniorSecrets from './SeniorSecrets';
import AlumniDirectory from './AlumniDirectory';
import ClubPortal from './ClubPortal';
import GradeAlerts from './GradeAlerts';
import './CommunityPage.css';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed': return <StoryFeed />;
      case 'secrets': return <SeniorSecrets />;
      case 'alumni': return <AlumniDirectory />;
      case 'clubs': return <ClubPortal />;
      case 'alerts': return <GradeAlerts />;
      default: return <StoryFeed />;
    }
  };

  return (
    <div className="community-page animate-fadeIn">
      <div className="community-header">
        <h1 className="page-title">Social Square</h1>
        <p className="page-description">Share anonymous student confessions, lookup alumni networks, join active clubs, and read grade warning alerts.</p>
      </div>

      <div className="tabs community-tabs">
        <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Confessions Feed</button>
        <button className={`tab ${activeTab === 'secrets' ? 'active' : ''}`} onClick={() => setActiveTab('secrets')}>Seniors' Secrets</button>
        <button className={`tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => setActiveTab('alumni')}>Alumni Directory</button>
        <button className={`tab ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>Clubs Hub</button>
        <button className={`tab ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>Booster Alerts</button>
      </div>

      <div className="community-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
